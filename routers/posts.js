const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isAuthenticated = require("../middlewares/isAuthenticated");
const router = require("express").Router();
const prisma = new PrismaClient();


// postAPI
router.post("/post", isAuthenticated, async (req, res) => {
  const {content} = req.body;

  if(!content) {
    return res.status(400).json({message: "投稿内容がありません"})
  }

  try {
  const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.userId
      },
      include: {
        author: {
          include: {
            profile: true
          }
        }
      }
    })


    res.status(201).json(newPost)
  } catch (e) {
    console.error(e);
    res.status(500).json({message: "サーバーエラーです"})
  }
})

// latestPostAPI
router.get("/get_latest_post", async (req, res) => {
  try {
    const latestPosts = await prisma.post.findMany({
      take: 10, 
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          include: {
            profile: true
          }
        },
        likes: true // いいねの情報を含める
      }
    });

    // 各投稿にいいねの数を追加する
    const postsWithLikes = latestPosts.map(post => ({
      ...post,
      likeCount: post.likes.length // いいねの数
    }));

    return res.json(postsWithLikes);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});


// ユーザー投稿内容を取得 
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userProps = await prisma.post.findMany({
      where: {
        authorId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        author: true
      }
    });

    return res.json(userProps)
  } catch (err) {
    console.error(err)
    res.status(500).json({message: "サーバーエラーです"})
  }
})

// 投稿内容削除 
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        authorId: true,
      },
    })

    if (!post) {
      return res.status(404).json({ message: "投稿が見つかりません" });
    }

    await prisma.post.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(204).send(); 
  } catch (err) {
    console.error(err)
    res.status(500).json({message: "サーバーエラーです"})
  }
})

// 投稿内容更新
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body; // 更新後の投稿内容

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        authorId: true,
      },
    })

    if (!post) {
      return res.status(404).json({ message: "投稿が見つかりません" });
    }

    await prisma.post.update({
      where: {
        id: parseInt(id),
      },
      data: {
        content: content, 
      },
    });

    res.status(204).send(); // 更新成功の場合、204 No Contentを返す
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "サーバーエラーです" })
  }
});

// Create a new like
router.post("/like/:postId", isAuthenticated, async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(postId),
      },
    });

    if (!post) {
      return res.status(404).json({ message: "投稿が見つかりません" });
    }

    // Check if the user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: parseInt(postId),
        userId
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: "すでにいいね済みです" });
    }

    // Create a new like
    const newLike = await prisma.like.create({
      data: {
        postId: parseInt(postId),
        userId,
        isLiked: true,
      },
    });

    res.status(201).json(newLike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

router.post("/unlike/:postId",isAuthenticated, async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;
  console.log(postId)

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(postId),
      },
    });

    if (!post) {
      return res.status(404).json({ message: "投稿が見つかりません" });
    }
    
    // Check if the user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: parseInt(postId),
      },
    });

    if (!existingLike) {
      return res.status(400).json({ message: "いいねが見つかりません" });
    }

        // Delete the existing like to perform unlike
        await prisma.like.delete({
          where: {
            id: existingLike.id, 
          },
        });
    
        res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});


module.exports = router