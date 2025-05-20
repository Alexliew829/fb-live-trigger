const PAGE_ID = '101411206173416';
const ASSISTANT_ID = '100001418128376';
const TEST_POST_ID = '101411206173416_548839894726984';
const ACCESS_TOKEN = 'EAAJ8K1vORm8BO8NB3N2BcZBohdv9GpWXVjcOqA5mZBWuYlZBhuiC7U29ZABpJsLigA5dG4oFfg7BYkT2XxVnOqWtjKkJNPs27MZAwZAYZBov0WEy4UZAd6mlWv1i7kuOJjQy9DS0cWpcZAlQXE6jo1frxbJbBEDSP3PS0O0dCHYXImySAaRJZCuoBMEcsDtZCCGyO1oadIwDU1f3TwBPP0ZD';
const WEBHOOK_URL = 'https://hook.us2.make.com/jed2lptdmv1wjgvn3wdk6tuwxljguf45';

export default async function handler(req, res) {
  try {
    // 👉 测试用：抓固定影片贴文留言
    const commentsRes = await fetch(`https://graph.facebook.com/v19.0/${TEST_POST_ID}/comments?access_token=${ACCESS_TOKEN}`);
    const commentsData = await commentsRes.json();

    if (!commentsData?.data || commentsData.data.length === 0) {
      return res.status(200).json({ message: 'No comments yet. (test mode)' });
    }

    const triggerComment = commentsData.data.find(comment => {
      const message = comment?.message?.toLowerCase?.();
      const fromId = comment?.from?.id;
      return (
        (fromId === PAGE_ID || fromId === ASSISTANT_ID) &&
        (message === '关' || message === 'close')
      );
    });

    if (triggerComment) {
      try {
        const webhookRes = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: TEST_POST_ID })
        });

        // ✅ 不尝试解析 webhook 返回值，只检查状态
        if (!webhookRes.ok) {
          throw new Error(`Webhook failed. Status: ${webhookRes.status}`);
        }

        return res.status(200).json({
          message: 'Triggered countdown. (test mode)',
          post_id: TEST_POST_ID,
          comment: triggerComment.message
        });

      } catch (webhookError) {
        console.error('❌ Webhook Failed:', webhookError.message);
        return res.status(200).json({
          message: 'Comment matched, but webhook failed. (test mode)',
          error: webhookError.message,
          post_id: TEST_POST_ID
        });
      }
    }

    return res.status(200).json({ message: 'No matching comment found. (test mode)' });

  } catch (error) {
    console.error('Fatal Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
