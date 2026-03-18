import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',     // 全ての検索エンジンに対して
      disallow: '/',      // 全ページの巡回を禁止する
    },
  }
}