// ✅ 加强版 trigger.js：内建错误捕捉 + 关键词支持 + 日志输出

const PAGE_ID = '101411206173416';
const ASSISTANT_ID = '100001418128376';
const ACCESS_TOKEN = 'EAAJ8K1vORm8BO8NB3N2BcZBohdv9GpWXVjcOqA5mZBWuYlZBhuiC7U29ZABpJsLigA5dG4oFfg7BYkT2XxVnOqWtjKkJNPs27MZAwZAYZBov0WEy4UZAd6mlWv1i7kuOJjQy9DS0cWpcZAlQXE6jo1frxbJbBEDSP3PS0O0dCHYXImySAaRJZCuoBMEcsDtZCCGyO1oadIwDU1f3TwBPP0ZD';
const WEBHOOK_URL = 'https://hook.us2.make.com/jed2lptdmv1wjgvn3wdk6tuwxljguf45';

const KEYWORDS = ['关', 'close', 'ＣＬＯＳＥ', 'Ｃｌｏｓｅ', 'ｃｌｏｓｅ'];
const USER_IDS = [PAGE_ID, ASSISTANT_ID];

export default async function handler(req, res) {
  try {
    // 获取直播列表
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

    // 获取留言
    const commentsRes = await fetch(`https://graph.facebook.com/v19.0/${postId}/comments?fields=message,from,id&order=reverse_chronological&access_token=${ACCESS_TOKEN}`);
    const commentsData = await commentsRes.json();

    if (!commentsData?.data || commentsData.data.length === 0) {
      return res.status(200).json({ message: 'No comments yet.' });
    }

    const triggerComment = commentsData.data.find(comment => {
      const msg = comment?.message?.trim()?.toLowerCase?.();
      const fromId = comment?.from?.id;
      return msg && KEYWORDS.includes(msg) && USER_IDS.includes(fromId);
    });

    if (!triggerComment) {
      return res.status(200).json({ message: 'No matching comment found.' });
    }

    // 调用 Webhook
    try {
      const webhookRes = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      });

      if (!webhookRes.ok) {
        const errText = await webhookRes.text();
        return res.status(200).json({
          message: 'Comment matched, but webhook failed.',
          post_id: postId,
          error: errText
        });
      }

      return res.status(200).json({
        message: 'Triggered countdown.',
        post_id: postId,
        comment: triggerComment.message
      });
    } catch (webhookError) {
      return res.status(500).json({
        message: 'Webhook request failed.',
        error: webhookError.message
      });
    }
  } catch (error) {
    console.error('FATAL ERROR:', error);
    return res.status(500).json({ error: 'Internal Server Error', detail: error.message });
  }
} 
