"""Shared-host mode: the stack stays on loopback behind the host's own nginx."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import ssl
import subprocess

import pytest

ROOT = Path(__file__).parents[1]
SHARED = ROOT / "deploy/shared-host"
SUPABASE_CA = ROOT / "backend/certs/supabase-prod-ca-2021.crt"
SUPABASE_CA_SHA256 = "807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa"


def render_compose(tmp_path, **env):
    if shutil.which("docker") is None:
        pytest.skip("docker CLI not available")
    for name in ("compose.yml", "Caddyfile"):
        shutil.copy(ROOT / "deploy" / name, tmp_path / name)
    shutil.copy(SHARED / "compose.override.yml", tmp_path / "compose.override.yml")
    for name in ("backend.env", "n8n.env"):
        (tmp_path / name).write_text("")
    (tmp_path / "production.env").write_text("SITE_ADDRESS=:80\nFRONTEND_IMAGE=f\nBACKEND_IMAGE=b\n")
    result = subprocess.run(
        ["docker", "compose", "--env-file", "production.env", "config", "--format", "json"],
        cwd=tmp_path, env={**os.environ, **env}, capture_output=True, text=True, check=True,
    )
    return json.loads(result.stdout)["services"]


def test_only_the_gateway_is_published_and_only_on_loopback(tmp_path):
    services = render_compose(tmp_path, COMPOSE_PROFILES="automation")
    published = {name: svc.get("ports", []) for name, svc in services.items() if svc.get("ports")}
    assert all(p["host_ip"] == "127.0.0.1" for ports in published.values() for p in ports)
    assert [(p["published"], p["target"]) for p in published["gateway"]] == [("8180", 80)]


def test_n8n_stays_off_unless_its_profile_is_enabled(tmp_path):
    assert "n8n" not in render_compose(tmp_path)


def test_every_service_has_a_memory_limit(tmp_path):
    services = render_compose(tmp_path, COMPOSE_PROFILES="automation")
    assert all(svc.get("mem_limit") for svc in services.values())


def test_host_nginx_site_serves_only_the_triad_domain_through_loopback():
    conf = (SHARED / "nginx-triad.conf").read_text()
    assert re.search(r"server_name\s+eranusasiber\.my\.id\s+www\.eranusasiber\.my\.id;", conf)
    assert "default_server" not in conf
    assert not re.search(r"server_name[^;]*\s_[\s;]", conf)
    assert set(re.findall(r"proxy_pass\s+([^;]+);", conf)) == {"http://127.0.0.1:8180"}
    body_limit = int(re.search(r"client_max_body_size\s+(\d+)m;", conf).group(1))
    assert body_limit > 15  # backend accepts uploads up to 15 MB
    read_timeout = int(re.search(r"proxy_read_timeout\s+(\d+)s;", conf).group(1))
    assert read_timeout >= 3 * 120  # OpenAI client: 120 s timeout, 2 retries


def test_supabase_root_ca_is_the_pinned_certificate():
    der = ssl.PEM_cert_to_DER_cert(SUPABASE_CA.read_text())
    assert hashlib.sha256(der).hexdigest() == SUPABASE_CA_SHA256
    ssl.create_default_context(cafile=str(SUPABASE_CA))


def test_backend_env_example_points_database_tls_at_the_supabase_ca():
    example = (ROOT / "deploy/backend.env.example").read_text()
    assert "PGSSLROOTCERT=/app/certs/supabase-prod-ca-2021.crt" in example
