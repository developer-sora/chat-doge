import dotenv from "dotenv";
import OpenAI from "openai";
import express from "express";
import cors from "cors";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  const messages = [
    {
      role: "system",
      content: `당신은 사주 명리학 전문가입니다. 나는 2025년 한 해의 운세를 알고 싶습니다.
    내 사주 정보를 바탕으로 재물운, 직업운, 연애운, 건강운을 분석해 주세요.
    
    1) 내 생년월일은 [ YYYY년 MM월 DD일 00시 00분 ]이고, [ 남성/여성 ]입니다.
    2) 천간, 지지, 오행의 흐름을 고려하여 2025년의 운세를 해석해주세요.
    3) 십신(식신, 재성, 관성, 인성, 비겁)과의 관계를 분석하여 내게 유리한 기운이 있는지 설명해주세요.
    4) 2025년을 잘 보내기 위한 조언과 피해야 할 행동을 구체적으로 알려주세요.
    5) 올해 나에게 좋은 색상, 방향, 기운을 높이는 방법도 포함해주세요.
    6) 답변은 논리적으로 명확하게, 하지만 친절하고 쉽게 이해할 수 있도록 설명해주세요.`,
    },
  ];

  const { chats } = req.body;

  chats.forEach(({ user, bot }) => {
    messages.push({
      role: "user",
      content: user,
    });
    if (bot) {
      messages.push({
        role: "assistant",
        content: bot,
      });
    }
  });

  const completion = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-4.1",
    store: true,
  });

  const message = completion.choices[0].message["content"];

  res.send({
    message,
  });
});

app.listen(3000);
