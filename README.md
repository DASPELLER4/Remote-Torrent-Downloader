# Remote Torrent Downloader
A Node.JS program that let's you torrent from magnet links to a remote server incase your network doesn't allow P2P or you have no torrent client

Install requirments (as root):

    cd Remote-Torrent-Downloader 
    npm install express body-parser
    #Install aria2
    #Ubuntu/Debian
    apt install aria2
    #Arch
    pacman -S aria2
    #From source
    git clone https://github.com/aria2/aria2.git; cd aria2; autoreconf -i; ./configure; make; make install; cd ..; rm -rf aria2
    
Run web server (as root):

    node index.js
