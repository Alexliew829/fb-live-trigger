import fetch from 'node-fetch';

const PAGE_ID = '101411206173416';
const ASSISTANT_ID = '100001418128376';
const ACCESS_TOKEN = 'EAAJ8K1vORm8BO8NB3N2BcZBohdv9GpWXVjcOqA5mZBWuYlZBhuiC7U29ZABpJsLigA5dG4oFfg7BYkT2XxVnOqWtjKkJNPs27MZAwZAYZBov0WEy4UZAd6mlWv1i7kuOJjQy9DS0cWpcZAlQXE6jo1frxbJbBEDSP3PS0O0dCHYXImySAaRJZCuoBMEcsDtZCCGyO1oadIwDU1f3TwBPP0ZD';
const WEBHOOK_URL = 'https://hook.us2.make.com/jed2lptdmv1wjgvn3wdk6tuwxljguf45';

export default async function handler(req, res) {
  try {
    // 获取主页最近的直播视频贴文
    const videoRes = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/live_videos?access_token=${ACCESS_TOKEN}`);
    const videoData = await videoRes.json();
    const livePost = videoData.data?.find(v => v.status === 'LIVE');

    if (!livePost) {
      return res.status(200).json({ message: 'No live video found.' });
    }

    const postId = livePost.id;

    // 获取留言
    const commentsRes = await fetch(`https://graph.facebook.com/v19.0/${postId}/comments?access_token=${ACCESS_TOKEN}`);
    const commentsData = await commentsRes.json();

    const triggerComment = commentsData.data?.find(comment => {
      const message = comment.message?.toLowerCase();
      const fromId = comment.from?.id;
      return (
        (fromId === PAGE_ID || fromId === ASSISTANT_ID) &&
        (message === '关' || message === 'close')
      );
    });

    if (triggerComment) {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      });
      return res.status(200).json({ message: 'Triggered countdown.', post_id: postId });
    }

    return res.status(200).json({ message: 'No matching comment found.' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
