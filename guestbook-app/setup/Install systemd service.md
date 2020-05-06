# Install GuestBook systemd service

Ensure setup/start.sh has execution permissions
```
    cd guestbook-app/setup
    chmod +x start.sh
```

```
    sudo cp guestbook.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable guestbook.service
    sudo systemctl start guestbook
```

Read logs from the service

```
journalctl -u guestbook
```

## Change the application working directory


- Open /etc/systemd/system/guestbook.service
- Change lines with WorkingDirectory and ExecStart
- Then: 

```
    sudo systemctl daemon-reload
    sudo systemctl restart guestbook.service
```

## Change the service port

- Open /etc/systemd/system/guestbook.service
- Change line with PORT=
- Then: 

```
    sudo systemctl daemon-reload
    sudo systemctl restart guestbook.service
```
