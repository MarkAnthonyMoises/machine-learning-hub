import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ArticlePage() {
  const router = useRouter()
  const { id } = router.query

  const [article, setArticle] = useState(null)

  useEffect(() => {
    if (id) fetchArticle()
  }, [id])

  const fetchArticle = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    setArticle(data)
  }

  if (!article) return <p>Loading...</p>

  return (
    <div style={{ padding: 40 }}>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </div>
  )
}