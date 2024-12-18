console.log('Lets Write JavaScript');
let currentSong = new Audio()
let songs;
let currFolder;

function secondsToTimeFormat(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    // Ensure the input is an integer
    seconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format minutes and seconds as two digits
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // Show all the song in the playlist
    let SOngUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    SOngUL.innerHTML = ""
    for (const song of songs) {
        SOngUL.innerHTML = SOngUL.innerHTML + `<li>
                                <img class="invert" src="img/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>Sufii</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img width="35px" class="invert" src="img/play.svg" alt="">
                                </div></li>`
    }
    //  Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })

    });
    return songs




}
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {

        currentSong.play()
        play.src = "img/paused.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbum() {
    let a = await fetch(`/songs/`)
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            // console.log(response);

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
    <div class="play">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
            fill="none">
            <path
                d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                stroke="black" stroke-width="1.5" fill="#000" stroke-linejoin="round" />
        </svg>
    </div>
    <img src="/songs/${folder}/cover.jpg" alt="">
    <h2>${response.title}</h2>
    <p>${response.description}</p>
</div>`

        }
    }
    //  Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {

            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })

}

async function main() {
    //  Get list of all songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    //  Display all the album on the page
    displayAlbum()

    // Attach an event listener to play next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/paused.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //  Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToTimeFormat(currentSong.currentTime)} / ${secondsToTimeFormat(currentSong.duration)}`
        // seek moving
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })
    //     Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })
    //  Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //  Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    // Add an event listener for previous button
    previous.addEventListener("click", () => {
        console.log("previous clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })
    // Add an event listener for next button
    next.addEventListener("click", () => {
        console.log("Next clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    // Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting Volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume>0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg","img/volume.svg")

        }
    })
    // Add event listener to remove the track

    document.querySelector(".volume>img").addEventListener("click",(e) => {
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
      
    })

}
main()
