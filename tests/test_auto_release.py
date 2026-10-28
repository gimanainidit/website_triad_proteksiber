"""auto-release.sh deploys the newest green main build exactly once."""
import json
import os
from pathlib import Path
import subprocess

SCRIPT = Path(__file__).parents[1] / "deploy/shared-host/auto-release.sh"
REPO = "owner/repo"
OLD, NEW = "a" * 40, "b" * 40


def host(tmp_path, latest_green=NEW, api_fails=False, runs=None):
    deploy = tmp_path / "opt-triad"
    deploy.mkdir()
    (deploy / "production.env").write_text(
        f"SITE_ADDRESS=:80\nFRONTEND_IMAGE=ghcr.io/{REPO}-frontend:{OLD}\nBACKEND_IMAGE=ghcr.io/{REPO}-backend:{OLD}\n")
    release = deploy / "release.sh"
    release.write_text(f'#!/bin/sh\nprintf "%s\\n" "$*" >> "{tmp_path}/releases"\n')
    release.chmod(0o700)
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    body = json.dumps({"workflow_runs": [{"head_sha": latest_green}] if runs is None else runs})
    curl = bin_dir / "curl"
    curl.write_text("#!/bin/sh\nexit 22\n" if api_fails else
                    f'#!/bin/sh\nprintf "%s\\n" "$*" >> "{tmp_path}/curl-args"\ncat <<\'EOF\'\n{body}\nEOF\n')
    curl.chmod(0o755)
    env = dict(os.environ, TRIAD_DEPLOY_DIR=str(deploy), PATH=f"{bin_dir}:{os.environ['PATH']}")
    return env, deploy


def run(env):
    return subprocess.run(["bash", str(SCRIPT)], env=env, capture_output=True, text=True)


def releases(tmp_path):
    path = tmp_path / "releases"
    return path.read_text().splitlines() if path.exists() else []


def test_new_green_build_is_released_once(tmp_path):
    env, _ = host(tmp_path)
    assert run(env).returncode == 0
    assert run(env).returncode == 0  # production.env is unchanged by the fake release
    assert releases(tmp_path) == [f"{REPO} {NEW}"]
    assert f"repos/{REPO}/actions/workflows/vps.yml/runs" in (tmp_path / "curl-args").read_text()


def test_running_build_is_left_alone(tmp_path):
    env, _ = host(tmp_path, latest_green=OLD)
    assert run(env).returncode == 0
    assert releases(tmp_path) == []


def test_pause_file_stops_releases(tmp_path):
    env, deploy = host(tmp_path)
    (deploy / "auto-release.paused").touch()
    assert run(env).returncode == 0
    assert releases(tmp_path) == []


def test_unreachable_api_fails_without_releasing(tmp_path):
    env, _ = host(tmp_path, api_fails=True)
    assert run(env).returncode != 0
    assert releases(tmp_path) == []


def test_malformed_api_answer_fails_without_releasing(tmp_path):
    env, _ = host(tmp_path, latest_green="main; rm -rf /")
    assert run(env).returncode != 0
    assert releases(tmp_path) == []


def set_running(deploy, sha):
    (deploy / "production.env").write_text(
        f"FRONTEND_IMAGE=ghcr.io/{REPO}-frontend:{sha}\nBACKEND_IMAGE=ghcr.io/{REPO}-backend:{sha}\n")


def test_rollback_of_a_commit_released_by_hand_sticks(tmp_path):
    env, deploy = host(tmp_path)
    set_running(deploy, NEW)  # NEW went live without the timer (ship.sh, manual release.sh)
    assert run(env).returncode == 0
    set_running(deploy, OLD)  # operator rolls back
    assert run(env).returncode == 0
    assert releases(tmp_path) == []


def test_failed_release_is_not_retried(tmp_path):
    env, deploy = host(tmp_path)
    (deploy / "release.sh").write_text(f'#!/bin/sh\nprintf "%s\\n" "$*" >> "{tmp_path}/releases"\nexit 1\n')
    assert run(env).returncode != 0
    assert run(env).returncode == 0
    assert releases(tmp_path) == [f"{REPO} {NEW}"]


def test_unconfigured_host_waits_quietly(tmp_path):
    env, deploy = host(tmp_path)
    (deploy / "production.env").write_text("FRONTEND_IMAGE=ghcr.io/owner/repo-frontend:COMMIT_SHA\n")
    result = run(env)
    assert result.returncode == 0
    assert releases(tmp_path) == []


def test_empty_api_answer_fails_with_one_line(tmp_path):
    env, _ = host(tmp_path, runs=[])
    result = run(env)
    assert result.returncode != 0
    assert releases(tmp_path) == []
    assert len(result.stderr.strip().splitlines()) == 1, result.stderr
