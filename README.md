# Remote Torrent Downloader
A Node.JS program that let's you torrent from magnet links to a remote server incase your network doesn't allow P2P or you have no torrent client

Install requirments:

    npm install express body-parser
    #Ubuntu/Debian
    apt-get install aria2
    #Gentoo
    emerge -a net-misc/aria2
    #Arch
    pacman -S aria2
    
Run web server (as root):

    node index.js
