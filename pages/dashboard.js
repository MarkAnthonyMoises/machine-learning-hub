import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

const smallBtn = {
  fontSize: "13px",
  padding: "6px 12px",
  width: "125px",
  height: "34px",
  marginTop: "5px",
  cursor: "pointer",
  borderRadius: "6px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "linear-gradient(90deg, #ff7eb3, #ff758c)",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [newArticle, setNewArticle] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        const name = data.session.user.email.split("@")[0];
        setUsername(name);
      } else router.push('/signup');
    });

    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('likes', { ascending: false });

    if (data) setArticles(data);
  };

  const publishArticle = async () => {
    if (!title || !newArticle || !user) return;

    try {
      const { error } = await supabase
        .from('articles')
        .insert([
          {
            title,
            content: newArticle,
            likes: 0,
            user_id: user.id,
            username: username
          }
        ]);

      if (error) throw error;

      try {
        await fetch("/api/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            emails: [user.email],
            title,
            author: username
          })
        });
      } catch (e) {
        console.log("email notify failed");
      }

      setTitle('');
      setNewArticle('');
      setImportUrl('');
      fetchArticles();

    } catch (err) {
      console.error(err);
    }
  };

  const likeArticle = async (id) => {
    const article = articles.find(a => a.id === id);

    await supabase
      .from('articles')
      .update({ likes: (article.likes || 0) + 1 })
      .eq('id', id);

    fetchArticles();
  };

  const deleteArticle = async (id) => {
    const confirmDelete = confirm("Delete this article?");
    if (!confirmDelete) return;

    await supabase.from('articles').delete().eq('id', id);
    await supabase.from('comments').delete().eq('article_id', id);

    fetchArticles();
  };

  // ✅ UPDATED SHARE FUNCTION
const shareArticle = async (id) => {
  const url = `${window.location.origin}/article/${id}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Check out this article",
        text: "Read this article:",
        url: url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  } catch (err) {
    console.log("Share cancelled");
  }
};

const importArticle = async () => {
  if (!importUrl) return;

  try {
    const cleanUrl = importUrl.trim();

    const res = await fetch(
      `/api/import?url=${encodeURIComponent(cleanUrl)}`
    );

    const data = await res.json();

    setTitle(data.title);
    setNewArticle(data.content);

  } catch (err) {
    alert("Failed to import article");
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signup');
  };

  if (!user) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div style={{
      minHeight: "100vh",
      padding: "30px",
      width: "100%",
      boxSizing: "border-box"
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <div style={{ fontWeight: "bold" }}>
            @{username}
          </div>
        </div>

        <button style={smallBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* PUBLISH */}
      <section style={{
        marginBottom: 40,
        paddingBottom: 25,
        borderBottom: "1px solid rgba(255,255,255,0.15)"
      }}>
        <h2>Publish Article</h2>

        <div style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 10
        }}>
          <input
            placeholder="Paste article URL..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            style={{
              flex: 1,
              minWidth: 250,
              padding: 10
            }}
          />

          <button style={smallBtn} onClick={importArticle}>
            Import
          </button>
        </div>

        <input
          placeholder="Article title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10
          }}
        />

        <textarea
          placeholder="Write article..."
          value={newArticle}
          onChange={(e) => setNewArticle(e.target.value)}
          style={{
            width: "100%",
            height: 140,
            padding: 10,
            marginBottom: 10
          }}
        />

        <button style={smallBtn} onClick={publishArticle}>
          Publish
        </button>
      </section>

      {/* ARTICLES */}
      <section>
        <h2 style={{
          borderBottom: "2px solid rgba(255,255,255,0.2)",
          paddingBottom: 8,
          marginBottom: 20
        }}>
          Top Articles
        </h2>

        {articles.map(article => (
          <div key={article.id} style={{
            marginBottom: 35,
            paddingBottom: 20,
            borderBottom: "1px solid rgba(255,255,255,0.15)"
          }}>
            <h3 style={{ marginBottom: 5 }}>
              {article.title}
            </h3>

            <div style={{
              fontSize: 13,
              opacity: 0.7,
              marginBottom: 10
            }}>
              By @{article.username || "anonymous"}
            </div>

            <p style={{ marginBottom: 10 }}>
              {article.content}
            </p>

            <div style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap"
            }}>
              <button style={smallBtn} onClick={() => likeArticle(article.id)}>
                👍 Like ({article.likes || 0})
              </button>

              <button style={smallBtn} onClick={() => deleteArticle(article.id)}>
                🗑 Delete
              </button>

              <button style={smallBtn} onClick={() => shareArticle(article.id)}>
                🔗 Share
              </button>
            </div>

            <Comments articleId={article.id} username={username} />
          </div>
        ))}
      </section>
    </div>
  );
}

/* ================= COMMENTS ================= */

function Comments({ articleId, username }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });

    setComments(data || []);
  };

  const addComment = async () => {
    if (!text) return;

    await supabase.from('comments').insert([
      {
        article_id: articleId,
        text,
        parent_id: null,
        username: username
      }
    ]);

    setText('');
    fetchComments();
  };

  const addReply = async (parentId) => {
    if (!replyText) return;

    await supabase.from('comments').insert([
      {
        article_id: articleId,
        text: replyText,
        parent_id: parentId,
        username: username
      }
    ]);

    setReplyText('');
    setReplyTo(null);
    fetchComments();
  };

  const parentComments = comments.filter(c => !c.parent_id);
  const getReplies = (id) => comments.filter(c => c.parent_id === id);

  return (
    <div style={{ marginTop: 15 }}>
      <div style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write comment..."
          style={{
            flex: 1,
            minWidth: 220,
            padding: 8
          }}
        />

        <button style={smallBtn} onClick={addComment}>
          Comment
        </button>
      </div>

      <div style={{ marginTop: 15 }}>
        {parentComments.map(comment => (
          <div key={comment.id} style={{ marginBottom: 15 }}>
            <div>
              <b>@{comment.username || "anonymous"}</b>: {comment.text}
            </div>

            <button style={smallBtn} onClick={() => setReplyTo(comment.id)}>
              Reply
            </button>

            {replyTo === comment.id && (
              <div style={{
                marginTop: 5,
                display: "flex",
                gap: 8
              }}>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write reply..."
                  style={{
                    flex: 1,
                    padding: 8
                  }}
                />

                <button style={smallBtn} onClick={() => addReply(comment.id)}>
                  Send
                </button>
              </div>
            )}

            <div style={{
              marginLeft: 20,
              marginTop: 8
            }}>
              {getReplies(comment.id).map(reply => (
                <div key={reply.id}>
                  <b>@{reply.username}</b>: {reply.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}