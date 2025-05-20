// ✅ 修改版 trigger.js
// 确保精准抓取最新、真正正在直播的影片贴文 ID

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const PAGE_ID = '101411206173416';
  const ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // 建议用 Vercel 环境变量
  const WEBHOOK_URL = 'https://hook.us2.make.com/jed2lptdmv1wjgvn3wdk6tuwxljguf45';
  const KEYWORDS = ['关', 'close', 'Close', 'ＣＬＯＳＥ'];
  const USER_IDS = ['100001418128376', PAGE_ID];

  try {
    // 🔍 获取正在直播中的视频（确保按时间排序）
    const videoRes = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/live_videos?fields=id,creation_time,status&access_token=${ACCESS_TOKEN}`);
    const videoData = await videoRes.json();

    if (!videoData.data || videoData.data.length === 0) {
      return res.status(200).json({ message: 'No live video found.' });
    }

    // ✅ 按 creation_time 倒序，找最新的 LIVE 中影片
    const liveVideo = videoData.data
      .filter(v => v.status === 'LIVE')
      .sort((a, b) => new Date(b.creation_time) - new Date(a.creation_time))[0];

    if (!liveVideo) {
      return res.status(200).json({ message: 'No live video currently streaming.' });
    }

    const postId = liveVideo.id;

    // 🔍 抓留言
    const commentRes = await fetch(`https://graph.facebook.com/v19.0/${postId}/comments?fields=message,from,id&order=reverse_chronological&access_token=${ACCESS_TOKEN}`);
    const commentData = await commentRes.json();

    if (!commentData.data || commentData.data.length === 0) {
      return res.status(200).json({ message: 'No comments found.' });
    }

    const matched = commentData.data.find(c =>
      KEYWORDS.includes(c.message?.trim()) && USER_IDS.includes(c.from?.id)
    );

    if (!matched) {
      return res.status(200).json({ message: 'No matching comment found.' });
    }

    // ✅ 成功匹配后，发送到 Make Webhook
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId })
    });

    return res.status(200).json({ message: 'Triggered countdown.', post_id: postId, comment: matched.message });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
