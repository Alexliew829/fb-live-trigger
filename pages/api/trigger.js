// ✅ 强化版 trigger.js：支持大小写 + 全形 CLOSE

const PAGE_ID = '101411206173416';
const ASSISTANT_ID = '100001418128376';
const ACCESS_TOKEN = 'EAAJ8K1vORm8BO8NB3N2BcZBohdv9GpWXVjcOqA5mZBWuYlZBhuiC7U29ZABpJsLigA5dG4oFfg7BYkT2XxVnOqWtjKkJNPs27MZAwZAYZBov0WEy4UZAd6mlWv1i7kuOJjQy9DS0cWpcZAlQXE6jo1frxbJbBEDSP3PS0O0dCHYXImySAaRJZCuoBMEcsDtZCCGyO1oadIwDU1f3TwBPP0ZD';
const WEBHOOK_URL = 'https://hook.us2.make.com/jed2lptdmv1wjgvn3wdk6tuwxljguf45';

const KEYWORDS = ['关', 'close', 'close', 'ｃｌｏｓｅ', 'ＣＬＯＳＥ', 'Ｃｌｏｓｅ'];
const USER_IDS = [PAGE_ID, ASSISTANT_ID];

export default async function handler(req, res) {
  try {
    const videoRes = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/live_videos?fields=id,creation_time,status&access_token=${ACCESS_TOKEN}`);
    const videoData = await videoRes.json();

    if (!videoData?.data || videoData.data.length === 0) {
      return res.status(200).json({ message: 'No live video found.' });
    }

    const liveVideo = videoData.data
      .filter(v => v.status === 'LIVE')
      .sort((a, b) => new Date(b.creation_time) - new Date(a.creation_time))[0];

    if (!liveVideo) {
      return res.status(200).json({ message: 'No live video currently streaming.' });
    }

    const postId = liveVideo.id;

    const commentsRes = await fetch(`https://graph.facebook.com/v19.0/${postId}/com
