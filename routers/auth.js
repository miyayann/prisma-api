const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateIdenticon = require("../utils/generateIdenticon");
const router = require("express").Router();
const prisma = new PrismaClient();


// ユーザー登録
router.post("/register", async (req, res) => {
  const {username, email, password} = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const defaultIconImage = generateIdenticon(email);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      profile: {
        create: {
          bio: "はじめまして",
          profileImageUrl: defaultIconImage,
        },
      },
    },
    include: {
      profile: true
    }
  })

  return res.json({user});
})

// ログインAPI
router.post("/login", async (req, res) => {
  const {password, email} = req.body;

  const user = await prisma.user.findUnique({where: {email}});

  if(!user) {
    return res.status(401).json({error: "ユーザーが存在しません"});
  }

  const isPasswordVaild = await bcrypt.compare(password, user.password)

  if(!isPasswordVaild) {
    return res.status(401).json({error: "パスワードが間違ってます"});
  }

  const token = jwt.sign({id: user.id}, process.env.SECRET_KEY, {
    expiresIn: "1d", 
  })
  return res.json({token})
})

module.exports = router