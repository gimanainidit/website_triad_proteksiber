"""Exercise release script rollback when a database-backed smoke check fails."""
import os
from pathlib import Path
import subprocess


def test_failed_smoke_check_restores_previous_images(tmp_path):
    original = "SITE_ADDRESS=http://example.invalid\nFRONTEND_IMAGE=old-frontend\nBACKEND_IMAGE=old-backend\n"
    (tmp_path / "production.env").write_text(original)
    docker = tmp_path / "docker"
    docker.write_text("#!/bin/sh\nprintf '%s\\n' \"$*\" >> \"$TRIAD_DEPLOY_DIR/docker-calls\"\ncase \"$*\" in *'exec -T backend'*) exit 1;; esac\n")
    docker.chmod(0o700)
    env = dict(os.environ, TRIAD_DEPLOY_DIR=str(tmp_path), PATH=f"{tmp_path}:{os.environ['PATH']}")
    script = Path(__file__).parents[1] / "deploy/release.sh"
    result = subprocess.run(["bash", str(script), "owner/repo", "a" * 40], env=env, capture_output=True)
    assert result.returncode != 0
    assert (tmp_path / "production.env").read_text() == original
    assert "up -d frontend backend gateway" in (tmp_path / "docker-calls").read_text()
