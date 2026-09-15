<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>RSS 订阅 - <xsl:value-of select="rss/channel/title"/></title>
      <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: #0f0f1a;
          color: #e2e2e8;
          line-height: 1.7;
          min-height: 100vh;
        }
        .wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 20px;
        }
        header {
          text-align: center;
          margin-bottom: 40px;
        }
        .rss-icon {
          width: 48px; height: 48px;
          margin-bottom: 16px;
        }
        h1 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #8890a4;
          font-size: 0.95rem;
        }
        .feed-url {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(142,123,239,0.08);
          border: 1px solid rgba(142,123,239,0.25);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 36px;
        }
        .feed-url code {
          flex: 1;
          font-family: "SF Mono", "Fira Code", Consolas, monospace;
          font-size: 0.82rem;
          color: #8e7bef;
          word-break: break-all;
        }
        .copy-btn {
          flex-shrink: 0;
          padding: 8px 14px;
          border: 1px solid rgba(142,123,239,0.4);
          border-radius: 8px;
          background: transparent;
          color: #8e7bef;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .copy-btn:hover {
          background: rgba(142,123,239,0.12);
        }
        .items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .item {
          display: block;
          text-decoration: none;
          color: inherit;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px 24px;
          transition: all 0.2s ease;
        }
        .item:hover {
          border-color: rgba(142,123,239,0.3);
          background: rgba(142,123,239,0.04);
          transform: translateY(-1px);
        }
        .item-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 6px;
        }
        .item-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          font-size: 0.78rem;
          color: #8890a4;
        }
        .item-cat {
          color: #8e7bef;
          font-weight: 600;
        }
        .item-desc {
          font-size: 0.88rem;
          color: #a8adbf;
          line-height: 1.6;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 0.8rem;
          color: #5a6078;
        }
        .footer a {
          color: #8e7bef;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="wrap">
        <header>
          <svg class="rss-icon" viewBox="0 0 24 24" fill="#f47c31">
            <path d="M4 4a2 2 0 012 2v.093a2 2 0 01-2 2A2 2 0 014 4z"/>
            <path d="M4 8c7.732 0 14 6.268 14 14h-4c0-5.523-4.477-10-10-10H4z"/>
            <path d="M4 14c4.418 0 8 3.582 8 8H8c0-2.21-1.79-4-4-4v-4z"/>
          </svg>
          <h1><xsl:value-of select="rss/channel/title"/></h1>
          <p class="subtitle"><xsl:value-of select="rss/channel/description"/></p>
        </header>

        <div class="feed-url">
          <code id="feedUrl"><xsl:value-of select="rss/channel/atom:link/@href"/></code>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('feedUrl').textContent).then(()=>{this.textContent='已复制';setTimeout(()=>this.textContent='复制链接',1500)})" type="button">复制链接</button>
        </div>

        <div class="items">
          <xsl:for-each select="rss/channel/item">
            <a class="item" href="{link}">
              <div class="item-title"><xsl:value-of select="title"/></div>
              <div class="item-meta">
                <span class="item-cat"><xsl:value-of select="category[1]"/></span>
                <span>·</span>
                <span><xsl:value-of select="pubDate"/></span>
              </div>
              <div class="item-desc"><xsl:value-of select="description"/></div>
            </a>
          </xsl:for-each>
        </div>

        <p class="footer">
          将链接复制到 <a href="https://feedly.com/i/discover/sources/search/feed/http://tan17ocean.github.io/feed.xml" target="_blank" rel="noopener">Feedly</a>、
          <a href="https://www.inoreader.com/?add_feed=tan17ocean.github.io/feed.xml" target="_blank" rel="noopener">Inoreader</a> 等阅读器即可订阅
        </p>
      </div>
    </body>
    </html>
  </xsl:template>
</xsl:stylesheet>