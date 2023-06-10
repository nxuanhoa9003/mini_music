const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "XuanHoa_plyer";

const player = $(".player");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const arr = [];

const app = {
  currenIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Beautiful In White",
      singer: "Shane Filan",
      path: "./accsets/music/BeautifulInwhite.mp3",
      image: "./accsets/img/beatiful-in-white.jpg",
    },

    {
      name: "Take Me To Your Heart",
      singer: "Michael Learns To Rock",
      path: "./accsets/music/take-me-to-your-heart.mp3",
      image: "./accsets/img/take-me-to-your-heart.jpg",
    },

    {
      name: "Say You Will",
      singer: "Tokyo Square",
      path: "./accsets/music/say_you_will.mp3",
      image: "./accsets/img/Say_You_Will.png",
    },

    {
      name: "Waiting For You",
      singer: "Mono",
      path: "./accsets/music/Waiting-For-You.mp3",
      image: "./accsets/img/mono.jpg",
    },

    {
      name: "Vỡ Tan",
      singer: "Trịnh Thăng Bình",
      path: "./accsets/music/vo-tan.mp3",
      image: "./accsets/img/votan.jpg",
    },

    {
      name: "Thấy Chưa",
      singer: "Ngọt",
      path: "./accsets/thaychua.mp3",
      image: "./accsets/img/thaychua.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currenIndex ? "active" : ""
        }" data-index ="${index}">
            <div
                class="thumb"
                style="
                    background-image: url('${song.image}');
                "
            ></div>

            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>

            <div class="option">
                <i class="bx bx-dots-horizontal-rounded"></i>
            </div>
      </div>
        `;
    });

    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currenIndex];
      },
    });
  },

  handelEnvent: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate(
      [{ transform: "rotate(360deg)" }],
      { duration: 10000, iterations: Infinity } // 10 sencond
    );

    cdThumbAnimate.pause();

    // xử lý phóng to thu nhỏ
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newcdWith = cdWidth - scrollTop;
      cd.style.width = newcdWith > 0 ? newcdWith + "px" : 0;
      cd.style.opacity = newcdWith / cdWidth;
    };

    // xử lí khí click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // khi song được pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );

        progress.value = progressPercent;
      }
    };

    // xử lí khi tua bài hát
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandom();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // khi previous xong
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandom();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // xử lí bật / tắt random
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    //xử lí phát lại 1 bài hát khi ấn icon repeat
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };
    // xử lí next song sau khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // lắng nghe click vào playlists
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        // xử lý khi click vào song
        if (songNode) {
          _this.currenIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: this.currenIndex > 1 ? "nearest" : "center",
      });
    }, 500);
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
  },

  nextSong: function () {
    this.currenIndex++;
    if (this.currenIndex >= this.songs.length) {
      this.currenIndex = 0;
    }

    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currenIndex--;
    if (this.currenIndex < 0) {
      this.currenIndex = this.songs.length - 1;
    }

    this.loadCurrentSong();
  },

  playRandom: function () {
    let newIndex;
    let check;

    do {
      check = false;
      newIndex = Math.floor(Math.random() * this.songs.length);

      arr.forEach((e) => {
        if (e === newIndex) {
          check = true;
          return;
        }
      });

      if (!check) {
        arr.push(newIndex);
      }
    } while (check);
    // console.log("test=", arr);
    if (arr.length === this.songs.length) {
      arr.length = 0;
    }
    this.currenIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    // gán cấu hình từ cofig vào object app
    this.loadConfig();
    // định nghĩa các thuộc tính cho Object
    this.defineProperties();

    // lắng nghe / xử lý các sự kiện dom events
    this.handelEnvent();

    // tải thông tin bài hát đầu tiên vào ui khi chạy ứng dung
    this.loadCurrentSong();

    // render playlist
    this.render();
    // hiển thị trạng thái ban đầu của button repeat and button random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
