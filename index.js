const { isAuthenticated } = require("./src/middlewares")
const middlewares = require('./src/middlewares');
const { db } = require('./src/utils/db');
const api = require('./src/api');

const express = require('express');
const axios = require("axios")
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require("cors")
const fs = require("fs")
const { Readable } = require('stream');
const request = require('request');
//const puppeteer = require("puppeteer")
const path = require("path")
const { ImgurClient } = require('imgur');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath)
const { v4: uuid } = require('uuid')
const userAgent = require('user-agents');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { analyze, tokenize, wakati} = require("@enjoyjs/node-mecab")
const morgan = require('morgan');
const helmet = require('helmet');
const { connect } =  require('puppeteer-real-browser')
const HttpsProxyAgent = require('https-proxy-agent');
const SocksProxyAgent = require('socks-proxy-agent');

globalThis.fetch = fetch;

const client = new ImgurClient({ clientId: process.env.CLIENT_ID });

const app = express()

const corsOptions = {
  origin: '*', // Allow only your trusted frontend
  methods: ['GET', 'POST', 'DELETE', 'PATCH'], // Allowed HTTP methods
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Api-Key',
    'Authorization'
  ],
  credentials: true
}

app.use(cors(corsOptions));

app.use('/storage', express.static(path.join(__dirname, 'storage')));

app.use(morgan('dev'));
app.use(helmet({
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}))
app.use(express.json());

app.use('/api/v1', api);

function checkExistsWithTimeout(filePath, timeout) {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () {
      watcher.close();
      reject(new Error('File did not exists and was not created during the timeout.'));
    }, timeout);

    fs.access(filePath, fs.constants.R_OK, function (err) {
      if (!err) {
        clearTimeout(timer);
        watcher.close();
        resolve(`${filePath} exists`);
      }
    });

    var dir = path.dirname(filePath);
    var basename = path.basename(filePath);
    var watcher = fs.watch(dir, function (eventType, filename) {
      if (eventType === 'rename' && filename === basename) {
        clearTimeout(timer);
        watcher.close();
        resolve(`${filename} exists`);
      }
    });
  });
}


// const downloadVideo = async (url) => {
//   // Launch a headless browser
//   console.log("URL", url)
//   //const {origin} = await axios.get("https://httpbin.org/ip")
//
//   const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
//     'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
//
//   //const browser = await puppeteer.launch({headless:false, args: [`--proxy-server=${origin}`],});
//   const browser = await puppeteer.launch({headless: true, ignoreDefaultArgs: ['--enable-automation']});
//
//   // Open a new page
//   const page = await browser.newPage();
//   await page.setUserAgent(userAgent);
//
//   //await page.setUserAgent("Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)")
//
//
//   // Set a destination path for your downloaded video
//   const downloadPath = path.resolve(__dirname, 'storage');
//   fs.mkdirSync(downloadPath, { recursive: true });
//
//   await page._client.send('Page.setDownloadBehavior', {
//     behavior: 'allow',
//     downloadPath: downloadPath,
//   });
//
//   // Navigate to the video
//   await page.goto(url, { waitUntil: 'load' });
//
//   // This assumes you know the direct URL to the video file
//   // Sometimes you might need to extract this from a video tag or a dynamically generated source
//   const videoUrl = url;
//   console.log("URL2", url)
//
//   // Trigger download - this part depends heavily on how the website provides the video
//   // This example assumes you have a direct URL
//   const { fileName, fileType } = await page.evaluate(() => {
//     const el = document.querySelector('video');
//     const { src, type } = el.querySelector('source');
//
//     // filename from src attribute
//     const fileUrl = new URL(src);
//     const fileName = fileUrl.pathname.substring(fileUrl.pathname.lastIndexOf('/') + 1);
//
//     const downloadLink = document.createElement('a');
//     downloadLink.innerText = 'Download Video';
//     downloadLink.href = src;
//     downloadLink.download = fileName;
//
//     document.querySelector('body').appendChild(downloadLink);
//
//     return { fileName, fileType: type.split('/')[1] };
//   });
//
//   await page.click(`[download="${fileName}"]`);
//
//   //const res = await checkExistsWithTimeout(`/Users/dwhite/Downloads/${fileName}.${fileType}`, 30000);
//
//   await browser.close();
//
//   console.log('Download completed!');
// };

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))


const translate = async (text) => {
  console.log("URL", text)

  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});

  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString())

  await page.goto(`https://translate.google.com/?hl=ru&sl=ja&tl=en&text=${text}`, { waitUntil: 'load' });
  await page.waitForSelector("div[dir=\"ltr\"] > span[jsaction][lang][jsname] > span > span");

  const translatedText = await page.evaluate(async () => {

    const elements =  Array.from(document.querySelectorAll('div[dir="ltr"] > span[jsaction][lang][jsname] > span > span'))
    let text = elements.map(element => {
      return element.innerHTML
    })[0]

    const readingElement =  document.querySelector('div[aria-hidden="true"] > div[dir="ltr"] > span')

    console.log(123)
    console.log({ text, reading: readingElement?.innerHTML })
    return { text, reading: readingElement?.innerHTML.toLowerCase() ?? null }
  });
  // const elementsHendles = await page.evaluateHandle(() => document.querySelectorAll("div[dir=\"ltr\"]"));
  // let elements = await elementsHendles.getProperties();
  // console.log(elements)
  // let elements_arr = Array.from(elements.values()).map(e => e.styles)
  //const res = await checkExistsWithTimeout(`/Users/dwhite/Downloads/${fileName}.${fileType}`, 30000);

  //await sleep(10000)
  await browser.close();
  console.log(translatedText)

  return translatedText
}


app.post('/fetch-video', async (req, res) => {
  try {
    const {videoUrl} = req.body
    // const response = await fetch(videoUrl, {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'}})
    // const data = Buffer.from(await response.arrayBuffer())
    // const webmReadable = new Readable();
    // webmReadable._read = () => {  };
    // webmReadable.push(data);
    // const outputWebmStream = fs.createWriteStream('./storage/bunny.mp4');
    // webmReadable.pipe(outputWebmStream);
    //await downloadVideo(videoUrl)
    res.send({})
  } catch(err) {
    console.log(err)
    res.sendStatus(400)
  }
})

// app.get('/translate/:text', async (req, res) => {
//   try {
//     console.log(req.params)
//     const {text} = req.params
//     // const response = await fetch(videoUrl, {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'}})
//     // console.log(response)
//     // const data = Buffer.from(await response.arrayBuffer())
//     // console.log(123)
//     // console.log(data)
//     //
//     // const webmReadable = new Readable();
//     // webmReadable._read = () => {  };
//     // webmReadable.push(data);
//     //
//     // const outputWebmStream = fs.createWriteStream('./storage/bunny.mp4');
//     // webmReadable.pipe(outputWebmStream);
//
//     //console.log(videoUrl)
//     const translatedText = await translate(text)
//     //const gg = await translateText('text', opt)
//     //const { data } = await axios.get(`https://translate.google.com/?hl=ru&sl=ja&tl=en&text=${text}`)
//
//     // var regex = /<div\s[^>]*dir=["']ltr["'][^>]*>(.*?)<\/div>/gi;
//     //
//     // var matches, results = [];
//     // while ((matches = regex.exec(data)) !== null) {
//     //   results.push(matches[0]); // captures the entire div element string
//     // }
//     //
//     //
//     // console.log(results)
//     //console.log(match[0].filter(s => !s.include("jsname")))
//     res.send(translatedText)
//   } catch(err) {
//     console.log(err)
//     res.sendStatus(400)
//   }
// })

const cropVideo = (videoId, videoOutId, start, duration) => {
  return new Promise((resolve,reject)=> {
    const videoPath = path.resolve(__dirname, 'storage', videoId + ".mp4")
    const outPath = path.resolve(__dirname, 'storage', videoOutId + ".mp4")

    ffmpeg(videoPath)
      .setStartTime(start + ".300")
      .setDuration(duration + ".300")
      .output(outPath)
      .on('end', function (err) {
        if (!err) {
          console.log('conversion Done')
          resolve({videoPath, outPath})
        } else {
          reject()
        }
      })
      .on('progress', function(progress) {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('error', err => {
        reject()
        console.log('error: ', err)
      })
      .run()
  })
}

app.get("/clip/:videoId", async (req,res) => {
  try {
    console.log(req.params)
    const {videoId} = req.params
    const {startTime, duration} = req.query
    console.log(req.query)

    if(!startTime || !duration || !videoId) {
      return res.status(400)
    }

    const {outPath} = await cropVideo(videoId, uuid(), startTime, duration)

    const response = await client.upload({
      image: fs.createReadStream(outPath),
      type: 'stream',
    });
    console.log(response);

    res.send(response.data)
  } catch(err) {
    console.log(err)
    res.sendStatus(400)
  }
})

app.get("/translate/:text", async (req, res) => {
    console.log(req.params)
    const {text} = req.params

    const data = await translate(text)
    res.json(data)
})

app.post("/analyze", async (req, res) => {
  const {text} = req.body
  let results = []
  
  if(text) {
    for(const textItem of text) {
      try {
        const result = await tokenize(textItem)
        results.push(result)
      } catch(err) {
        console.log(err)
        results.push(null)
      }
    }
  }

  res.json({data: results})
})

app.post("/translate", async (req, res) => {
  console.log(req.body)
  const {words} = req.body
  let results = []

  if(words?.length) {
      try {
        const data = await translate(words.join(" | "))
        console.log(data)
        results = data.split(" | ")
      } catch(err) {
        console.log(err)
      }
  }

  res.json({data: results})
})

function shuffle(array) {
  let currentIndex = array.length;

  while (currentIndex != 0) {

    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array
}


const getProxyUrls = async () => {
  const { data } = await axios.get('https://advanced.name/freeproxy/6751a6b8b54da?type=socks5')
  const ips = shuffle(data.split('\r\n').slice(0, 200)).slice(0, 60)

  const proxyUrls = []
  const controllers = []

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(proxyUrls);
      controllers.forEach(controller => controller.abort())
    }, 5000);

    for (const ip of ips) {
      const proxyUrl = 'socks5://' + ip
      const controller = new AbortController()
      controllers.push(controller);

      const proxyAgent = new SocksProxyAgent.SocksProxyAgent(proxyUrl)

      axios
        .get('https://httpbin.dev/ip', {
          httpsAgent: proxyAgent,
          signal: controller.signal,
        })
        .then(response => {
          console.log(proxyUrl, response.data)
          proxyUrls.push(proxyUrl)
        })
        .catch(err => null)
    }
  })
}

const uploadVideoToImgur = (videoPath) => {
  return new Promise(async (resolve, reject) => {
    let retries = 0

    const fetchImgur = async () => {
      retries++
      const formData = new FormData();
      formData.append('video', fs.createReadStream(videoPath))

      const proxyUrls = await getProxyUrls()
      const randomizedProxyUrls = shuffle(proxyUrls)
      const proxyUrl = randomizedProxyUrls[0]

      console.log(proxyUrls)
      try {
        if(!proxyUrl) throw new Error("No proxy available")

        const proxyAgent = new SocksProxyAgent.SocksProxyAgent(proxyUrl)

        const imgurResponse = await axios.post('https://api.imgur.com/3/upload', formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Client-ID ${process.env.CLIENT_ID}`,
          },
          httpsAgent: proxyAgent
        })
        console.log(proxyUrl, imgurResponse.data)
        resolve(imgurResponse.data)
      } catch(err){
        console.log(err.code)
        if(retries >= 15) {
          reject()
          return
        }
        console.log("RETRY")
        await sleep(3000)
        fetchImgur()
      }
    }
    fetchImgur()
  })
}

app.post("/words", isAuthenticated, async (req, res) => {
  const { userId } = req.payload;

  const {kanji, kana, romaji, translation, sentence, sentenceTranslation, videoStart, videoEnd, videoUrl, hint} = req.body

  try {
    const video = await db.video.create({
      data: {

      }
    })


    const word = await db.word.create({
      data: {
        kanji,
        kana,
        romaji,
        translation,
        sentence,
        sentenceTranslation,
        videoStart,
        videoEnd,
        hint,
        userId,
        videoId: video.id
      },
    });

    res.json({data: word})

    const proxyVideoUrl = `${process.env.API_URL ?? 'https://animei.space'}/proxy/video/${encodeURIComponent(videoUrl)}`
    let videoPath = ''
    try {
      videoPath = await saveVideoFragment(proxyVideoUrl, video.id, videoStart, videoEnd - videoStart)
      // const response = await client.upload({
      //   image: fs.createReadStream(videoPath),
      //   type: 'stream',
      // });
      const imgurData = await uploadVideoToImgur(videoPath)

      // if (imgurResponse.data.success) {
      //   console.log('Video uploaded successfully:', imgurResponse.data.data.link);
      // } else {
      //   console.error('Failed to upload video:', imgurResponse.data);
      // }


      fs.unlink(videoPath, () => console.log("Deleted: " + videoPath))

      const updated = await db.video.update({
        where: {
          id: video.id
        },
        data: {
          url: imgurData.data.link,
          wordId: word.id
        }
      })
      console.log(updated)
    } catch(err) {
      fs.unlink(videoPath, () => console.log("Deleted: " + videoPath))
      console.log("Error while creating video")
      console.log(err)
    }
  } catch(err) {
    console.log(err)
    res.status(err.code || 500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
})

app.get("/words", isAuthenticated, async (req, res) => {
  const { userId } = req.payload;

  try {
    const data = await db.word.findMany({
      where: {
        userId
      },
      include: {
        Video: true
      },
    });

    res.json({data})
  } catch(err) {
    console.log(err)
    res.status(err.code || 500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
})

app.get("/words/test", async (req, res) => {
  try {
    const data = await db.word.findMany({
      include: {
        Video: true
      },
    });

    res.json({data})
  } catch(err) {
    console.log(err)
    res.status(err.code || 500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
})

app.delete("/words/:id", isAuthenticated, async (req, res) => {
  const { userId } = req.payload;
  const { id: wordId } = req.params

  try {
    const data = await db.word.delete({
      where: {
        userId,
        id: wordId
      }
    });

    res.json({data})
  } catch(err) {
    console.log(err)
    res.status(err.code || 500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
})

app.patch("/words/:id", isAuthenticated, async (req, res) => {
  const { userId } = req.payload;
  const { id: wordId } = req.params
  const { kanji, kana, translation, sentence, sentenceTranslation, hint } = req.body

  try {
    const data = await db.word.update({
      where: {
        userId,
        id: wordId
      },
      data: {
        kanji,
        kana,
        translation,
        sentence,
        sentenceTranslation,
        hint
      }
    })

    res.json({data})
  } catch(err) {
    console.log(err)
    res.status(err.code || 500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
})

app.post("/words/import", isAuthenticated, async (req, res) => {
  const { userId } = req.payload;
  const { data } = req.body

  const parsedWordsData = JSON.parse(data)

  await db.word.deleteMany({
    where: {
      userId
    }
  })

  const wordsData = parsedWordsData.map(w => ({
    kanji: w.kanji,
    kana: w.kana,
    romaji: w.romaji,
    translation: w.translation,
    sentence: w.sentence,
    sentenceTranslation: w.sentenceTranslation,
    videoStart: w.videoStart,
    videoEnd: w.videoEnd,
    hint: w.hint,
    userId,
    videoId: w.videoId
  }))

  try {
    const data = await db.word.createMany({
      data: wordsData
    })

    res.json({data})
  } catch(err) {
    console.log(err)
    res.status(err.code || 500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
})

const saveVideoFragment = async (videoUrl, videoOutName, startTime, duration) => {
  return new Promise((resolve, reject) => {
    const outPath = path.resolve(__dirname, 'storage', videoOutName + ".mp4")

    ffmpeg(videoUrl)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => {
          resolve(outPath)
          console.log('Processing finished!')
        })
        .on('error', (err) => {
          reject(err)
          console.log('Error:', err)
        })
        .run()
  })
}

app.get('/proxy/video/:url', async (req, res) => {
  const videoUrl = decodeURIComponent(req.params.url)
  const parsedUrl = new URL(videoUrl);
  console.log(videoUrl, parsedUrl.origin)
  const headers = {
    'range': req.headers.range,
    'accept': '*/*',
    'accept-encoding': 'identity;q=1, *;q=0',
    'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'referer': parsedUrl.origin,
    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'video',
    'sec-fetch-mode': 'no-cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'accept-ranges': 'bytes',
  };

  request({ url: videoUrl,
    headers,
    followAllRedirects: true })
      .on('response', (response) => {
        const contentType = response.headers['content-type'] || 'application/octet-stream';

        res.set({
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache',
          'Cross-Origin-Resource-Policy': 'cross-origin',
        });
        const videoSize = parseInt(response.headers['content-length'], 10)

        if (req.headers.range) {
          const range = req.headers.range
          const parts = range.replace(/bytes=/, "").split("-")
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1
          const chunkSize = (end - start) + 1

          res.status(206);
          res.set({
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Content-Length': chunkSize,
          });

          response.pipe(res, { end: false })

          response.once('end', () => res.end())
        } else {
          response.pipe(res)
        }
      })
      .on('error', (err) => {
        console.error('Error fetching video:', err)
        res.status(500).send('Error fetching video')
      });
});

process.on('uncaughtException', (err) => {
  console.error('Unhandled Error:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// const getVideoUrlFromAnimelonPageOld = async (videoId) => {
//   const browser = await puppeteer.launch({headless: false, args: [
//       `--ignore-certificate-errors`,
//       `--no-sandbox`,
//       `--disable-setuid-sandbox`,
//       '--proxy-server=http://193.123.244.193:8080'
//     ], ignoreDefaultArgs: ['--enable-automation']});
//
//   const page = await browser.newPage();
//
//   await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
//
//   // Add the missing headers (sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, x-client-data)
//   // await page.setExtraHTTPHeaders({
//   //   'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
//   //   'sec-ch-ua-mobile': '?0',
//   //   'sec-ch-ua-platform': '"Windows"',
//   //   'x-client-data': 'CJG2yQEIpLbJAQipncoBCMzqygEIlqHLAQiFoM0BCLjIzQEI9c/OARj1yc0B', // Optional, but can help
//   //   'accept': '*/*',
//   //   'accept-encoding': 'identity;q=1, *;q=0',
//   //   'accept-language': 'en-US,en;q=0.9',
//   //   'range': 'bytes=0-', // Optional, if needed for partial content requests
//   //   'referer': 'https://animelon.com/',
//   //   'sec-fetch-dest': 'video',
//   //   'sec-fetch-mode': 'no-cors',
//   //   'sec-fetch-site': 'cross-site'
//   // });
//
//   return new Promise((resolve, reject) => {
//     page.on('response', async (response) => {
//       const prefixes = ['https://r4---', 'https://r1---', 'https://r2--', 'https://r3---', 'https://r5---'];
//       const urls = []
//       setTimeout(() => resolve(urls), 20000)
//       if(prefixes.some(prefix => response._request._url.includes(prefix)))
//         console.log(response._request)
//       if (prefixes.some(prefix => response._request._url.includes(prefix)) && (response._status === 206 || response._status === 302)) {
//         urls.push(response._request._url)
//       }
//     });
//
//     page.goto(`https://animelon.com/video/${videoId}`, { waitUntil: 'load' }).catch(reject);
//   });
// }

const getVideoUrlFromAnimelonPage = async (videoId) => {
  console.log(process.env.CHROME_PATH)
  const { page } = await connect({
    headless: false,
    fingerprint: true,
    turnstile: true,
    ignoreAllFlags: true
  });

  const data = await new Promise((resolve, reject) => {
    const urls = []

    setTimeout(async () => {
      resolve(urls)
    }, 20000)

    page.on('response', async (response) => {
      const prefixes = ['https://r4---', 'https://r1---', 'https://r2--', 'https://r3---', 'https://r5---'];

      if(prefixes.some(prefix => response.url().includes(prefix))) {
      }
      if (prefixes.some(prefix => response.url().includes(prefix)) && (response.status() === 206 || response.status() === 302)) {
        urls.push(response.url())
        //resolve(urls)
        //resolve(response.url())
      }
    });

    page.goto(`https://animelon.com/video/${videoId}`, { waitUntil: 'load' }).catch(reject);
  })

  await page.close();
  console.log(data)
  return data.length ? data[0] : ''
}

const updateVideo = async (video) => {
  const newVideoUrl = await getVideoUrlFromAnimelonPage(video.animelonVideoId)
  console.log("NEW VIDEO URL: ", newVideoUrl)

  if(newVideoUrl) {
    await db.video.update({
      where: {
        id: video.id
      },
      data: {
        url: newVideoUrl
      }
    });
  }
}

const refreshAnimelonVideos = async () => {
  const videos = await db.video.findMany({
    where: {
      updatedAt: {
        lt: new Date(Date.now() - 10 * 60 * 1000)
      }
    },
  })
  console.log(videos)

  for(const video of videos) {
    await updateVideo(video)
  }

  await sleep(10000)
  refreshAnimelonVideos()
}



const startCRUD = async () => {
  refreshAnimelonVideos()
}

app.listen(process.env.PORT, async () => {
  console.log('Server is listening on port ' + process.env.PORT);
  //startCRUD()
});