#!/usr/bin/python3
import os
import re
import sys

command = os.environ.get('SSH_ORIGINAL_COMMAND', '')
if command != 'status' and not re.fullmatch(r'(?:deploy|rollback) [a-f0-9]{40}', command):
    sys.exit('Only portfolio status/deploy/rollback is permitted')
os.execve('/usr/bin/sudo', ['sudo', '-n', '/opt/portfolio/control/gateway.py', command],
          {'PATH': '/usr/sbin:/usr/bin:/sbin:/bin', 'HOME': '/home/portfolio-deploy'})
