# Remote Torrent Downloader
A Node.JS program that let's you torrent from magnet links to a remote server incase your network doesn't allow P2P or you have no torrent client

It is on port 80 and available through your web browser

You can change the directory files are downloaded to by changing the downloadDir variable to any directory, you can remove the __dirname if you intend to have the directory outside of the Remote-Torrent-Downloader folder

<img src="https://i.imgur.com/laqbLio.png">
<img src="https://i.imgur.com/cZupv9C.png">

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
