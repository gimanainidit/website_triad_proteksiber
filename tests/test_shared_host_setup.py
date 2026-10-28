"""setup-host.sh installs the shared-host deployment without clobbering state."""
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).parents[1]
SCRIPT = ROOT / "deploy/shared-host/setup-host.sh"


def fake_host(tmp_path, nginx_test_fails=False):
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    calls = tmp_path / "calls"
    stub = "#!/bin/sh\nprintf '%s %s\\n' \"$(basename \"$0\")\" \"$*\" >> \"" + str(calls) + "\"\n"
    for name in ("id", "useradd", "usermod", "chown", "systemctl", "ss"):
        (bin_dir / name).write_text(stub + ("exit 1\n" if name == "id" else ""))
    (bin_dir / "nginx").write_text(stub + ("exit 1\n" if nginx_test_fails else ""))
    (bin_dir / "docker").write_text(stub + "echo 2.26.1\n")
    for f in bin_dir.iterdir():
        f.chmod(0o755)
    nginx = tmp_path / "etc-nginx"
    (nginx / "sites-available").mkdir(parents=True)
    (nginx / "sites-enabled").mkdir()
    env = dict(os.environ, PATH=f"{bin_dir}:{os.environ['PATH']}",
               TRIAD_DEPLOY_DIR=str(tmp_path / "opt-triad"), NGINX_DIR=str(nginx))
    return env, calls, nginx


def run(env):
    return subprocess.run(["bash", str(SCRIPT)], env=env, capture_output=True, text=True)


def test_installs_stack_files_and_private_env_files(tmp_path):
    env, calls, nginx = fake_host(tmp_path)
    result = run(env)
    assert result.returncode == 0, result.stderr
    deploy = tmp_path / "opt-triad"
    for name in ("compose.yml", "Caddyfile", "release.sh", "compose.override.yml"):
        assert (deploy / name).is_file()
    for name in ("production.env", "backend.env", "n8n.env"):
        assert (deploy / name).stat().st_mode & 0o777 == 0o600
    assert "SITE_ADDRESS=:80\n" in (deploy / "production.env").read_text()
    assert (nginx / "sites-enabled/triad").resolve() == nginx / "sites-available/triad"
    assert "systemctl reload nginx" in calls.read_text()


def test_rerun_keeps_existing_secrets(tmp_path):
    env, _, _ = fake_host(tmp_path)
    run(env)
    backend_env = tmp_path / "opt-triad/backend.env"
    backend_env.write_text("DATABASE_URL=real\n")
    assert run(env).returncode == 0
    assert backend_env.read_text() == "DATABASE_URL=real\n"


def test_failed_nginx_check_removes_the_site_and_skips_reload(tmp_path):
    env, calls, nginx = fake_host(tmp_path, nginx_test_fails=True)
    result = run(env)
    assert result.returncode != 0
    assert not (nginx / "sites-enabled/triad").exists()
    assert "systemctl reload nginx" not in calls.read_text()


def test_rerun_keeps_a_site_certbot_has_edited(tmp_path):
    env, _, nginx = fake_host(tmp_path)
    run(env)
    site = nginx / "sites-available/triad"
    site.write_text(site.read_text() + "    listen 443 ssl; # managed by Certbot\n")
    assert run(env).returncode == 0
    assert "listen 443 ssl" in site.read_text()


def test_failed_nginx_check_restores_a_previous_link_target(tmp_path):
    env, _, nginx = fake_host(tmp_path, nginx_test_fails=True)
    other = nginx / "sites-available/triad-old"
    other.write_text("server {}\n")
    (nginx / "sites-enabled/triad").symlink_to(other)
    assert run(env).returncode != 0
    assert (nginx / "sites-enabled/triad").resolve() == other


def test_refuses_to_replace_a_regular_file_in_sites_enabled(tmp_path):
    env, _, nginx = fake_host(tmp_path)
    handmade = nginx / "sites-enabled/triad"
    handmade.write_text("server { listen 80; }\n")
    assert run(env).returncode != 0
    assert handmade.read_text() == "server { listen 80; }\n"


def test_refuses_a_symlinked_env_file(tmp_path):
    env, _, _ = fake_host(tmp_path)
    run(env)
    production = tmp_path / "opt-triad/production.env"
    production.unlink()
    production.symlink_to(tmp_path / "elsewhere")
    assert run(env).returncode != 0
    assert not (tmp_path / "elsewhere").exists()
