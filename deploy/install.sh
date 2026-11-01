#!/usr/bin/env bash
set -Eeuo pipefail
[[ $EUID == 0 ]] || { echo 'Run as root'; exit 1; }
cd "$(dirname "$0")"
public_file=${1:?Dedicated public key file}
public_key=$(tr -d '\r\n' < "$public_file")
[[ "$public_key" =~ ^ssh-ed25519\ [A-Za-z0-9+/=]+\ portfolio-github-actions$ ]] || { echo 'Unexpected CI public key'; exit 1; }
install -d -o root -g root -m 755 /opt/portfolio /opt/portfolio/control /opt/portfolio/releases
install -d -o root -g root -m 700 /opt/portfolio/inbox
if ! id portfolio-deploy >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash portfolio-deploy
  passwd --lock portfolio-deploy >/dev/null
fi
[[ $(id -Gn portfolio-deploy) == portfolio-deploy ]] || { echo 'Unexpected deploy account groups'; exit 1; }
install -o root -g root -m 755 gateway.py ssh-command.py /opt/portfolio/control/
install -o root -g root -m 644 compose.yaml /opt/portfolio/control/
temporary=$(mktemp)
trap 'rm -f "$temporary"' EXIT
printf '%s\n' 'portfolio-deploy ALL=(root) NOPASSWD: /opt/portfolio/control/gateway.py *' > "$temporary"
visudo -cf "$temporary"
install -o root -g root -m 440 "$temporary" /etc/sudoers.d/portfolio-ci
chown root:root /home/portfolio-deploy
chmod 755 /home/portfolio-deploy
install -d -o root -g root -m 755 /home/portfolio-deploy/.ssh
entry="restrict,command=\"/opt/portfolio/control/ssh-command.py\" $public_key"
authorized=/home/portfolio-deploy/.ssh/authorized_keys
if [[ -s "$authorized" ]] && [[ $(cat "$authorized") != "$entry" ]]; then
  echo 'Existing portfolio key differs; inspect before replacing'; exit 1
fi
printf '%s\n' "$entry" > "$authorized"
chown root:root "$authorized"
chmod 644 "$authorized"
echo 'PASS portfolio CI account installed; Caddy and other Docker projects unchanged'
