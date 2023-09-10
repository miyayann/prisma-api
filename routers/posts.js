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
    orderBy: {createdAt: "desc"},
    include: {
      author: {
        include: {
          profile: true
        }
      }
    }
  })
  return res.json(latestPosts)
} catch (e) {
  console.error(e);
  res.status(500).json({message: "サーバーエラーです"})
}
})

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

module.exports = router