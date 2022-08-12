# Remote Torrent Downloader
A Node.JS program that let's you torrent from magnet links to a remote server incase your network doesn't allow P2P or you have no torrent client

It is on port 80 and available through your web browser

<img src="https://i.imgur.com/laqbLio.png">
<img src="https://i.imgur.com/1SBLO4l.png">

Install:

    git clone https://github.com/DASPELLER4/Remote-Torrent-Downloader

Install requirments (as root):

    cd Remote-Torrent-Downloader 
    npm install express body-parser
    #Install aria2
    #Ubuntu/Debian
    apt install aria2
    #Arch
    pacman -S aria2
    
Run web server (as root):

    node index.js
