const line = require("@line/bot-sdk");
const express = require("express");
const axios = require("axios");

const { isoToThaiDate } = require("./lib/dateIsoToThai")

require("dotenv").config();

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

const app = express();

app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  console.log(event);
  if (event.type !== "message" || event.message.type !== "text") {

    return Promise.resolve(null);
  }

  const userMessage = event.message.text.trim();

  if (userMessage === "ตรวจสอบข้อมูล") {
    const userId = event.source.userId;

    const apiUrl = `${process.env.GAS_URL}?lineUserId=${userId}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!Array.isArray(data) || data.length === 0) {
        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              "type": "flex",
              "altText": "ไม่พบข้อมูลสมาชิก กรุณายืนยันตัวตน",
              "contents": {
                "type": "bubble",
                "hero": {
                  "type": "image",
                  "url": `${process.env.HS6AJ_LOGO}`,
                  "size": "lg"
                },
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ยืนยันตัวตน",
                      "weight": "bold",
                      "size": "xl",
                      "align": "center"
                    },
                    {
                      "type": "text",
                      "text": "สมาคมวิทยุสมัครเล่นจังหวัดพิจิตร",
                      "align": "center",
                      "size": "md"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": "- ระบบไม่พบข้อมูลของท่าน ต้องทำการผูกบัญชีไลน์เข้ากับระบบโดยการยืนยันตัวตน",
                          "wrap": true,
                          "size": "sm"
                        },
                        {
                          "type": "text",
                          "text": "- เมื่อยืนยันตัวตนเรียบร้อยแล้วจึงจะสามารถตรวจสอบข้อมูลสมาชิกได้",
                          "wrap": true,
                          "size": "sm"
                        },
                        {
                          "type": "text",
                          "text": "- สงวนสิทธิ์ให้กับสมาชิกของสมาคมวิทยุสมัครเล่นจังหวัดพิจิตรเท่านั้น",
                          "wrap": true,
                          "size": "sm"
                        },
                        {
                          "type": "text",
                          "text": "- หากพบปัญหาการใช้งาน แจ้งในไลน์สมาคมได้เลยครับ",
                          "wrap": true,
                          "size": "sm"
                        }
                      ],
                      "margin": "lg"
                    }
                  ]
                },
                "footer": {
                  "type": "box",
                  "layout": "vertical",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "button",
                      "style": "primary",
                      "height": "sm",
                      "action": {
                        "type": "uri",
                        "label": "ยืนยันตัวตน",
                        "uri": `${process.env.HS6AJ_LIFF_URL}`
                      }
                    },
                    {
                      "type": "separator",
                      "margin": "md"
                    },
                    {
                      "type": "text",
                      "text": "สถานีวิทยุสมัครเล่นควบคุมข่ายจังหวัดพิจิตร HS6AJ",
                      "margin": "md",
                      "size": "xxs",
                      "wrap": true,
                      "color": "#aaaaaa",
                      "align": "center"
                    }
                  ],
                  "flex": 0
                }
              }
            },
          ],
        });
      } else {
        const member = data[0];
        let dateBoxes = [
          {
            "type": "box",
            "layout": "baseline",
            "spacing": "sm",
            "contents": [
              {
                "type": "text",
                "text": "เริ่มตั้งแต่:",
                "color": "#aaaaaa",
                "size": "sm",
                "flex": 4
              },
              {
                "type": "text",
                "text": isoToThaiDate(member.StartDate),
                "wrap": true,
                "color": "#666666",
                "size": "sm",
                "flex": 4
              }
            ]
          }
        ]

        if (member.MemberType !== "สามัญตลอดชีพ") {
          dateBoxes.push({
            "type": "box",
            "layout": "baseline",
            "spacing": "sm",
            "contents": [
              {
                "type": "text",
                "text": "สิ้นสุด:",
                "color": "#aaaaaa",
                "size": "sm",
                "flex": 4
              },
              {
                "type": "text",
                "text": isoToThaiDate(member.EndDate),
                "wrap": true,
                "color": "#666666",
                "size": "sm",
                "flex": 4
              }
            ]
          })
        }

        const flexMsg = {
            "type": "flex",
            "altText": `ข้อมูลสมาชิก ${member.CallSign}`,
            "contents": {
            "type": "bubble",
            "header": {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "image",
                  "url": `${process.env.HS6AJ_LOGO}`,
                  "size": "xxs",
                  "align": "start"
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "สมาคมวิทยุสมัครเล่นจังหวัดพิจิตร",
                      "wrap": true,
                      "size": "sm"
                    },
                    {
                      "type": "text",
                      "text": "Amateur Radio Associate of Phichit",
                      "wrap": true,
                      "size": "xxs"
                    }
                  ],
                  "flex": 4
                }
              ],
              "justifyContent": "space-between",
              "alignItems": "center",
              "height": "70px",
              "background": {
                "type": "linearGradient",
                "angle": "0deg",
                "startColor": "#ffffff",
                "endColor": "#01a54e"
              }
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "HS6AJ",
                  "size": "3xl",
                  "align": "center",
                  "weight": "bold",
                  "wrap": true,
                  "color": "#2dd4e3"
                },
                {
                  "type": "text",
                  "text": "ข้อมูลสมาชิก",
                  "weight": "bold",
                  "size": "md",
                  "margin": "md"
                },
                {
                  "type": "text",
                  "text": `${member.FullName}`,
                  "weight": "bold",
                  "size": "lg",
                  "wrap": true,
                  "align": "center",
                  "margin": "md"
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "margin": "md",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": "สัญญาณเรียกขาน:",
                          "color": "#aaaaaa",
                          "size": "sm",
                          "flex": 4,
                          "wrap": true
                        },
                        {
                          "type": "text",
                          "text": `${member.CallSign}`,
                          "wrap": true,
                          "color": "#666666",
                          "size": "md",
                          "flex": 4,
                          "weight": "bold"
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": "ประเภท:",
                          "color": "#aaaaaa",
                          "size": "sm",
                          "flex": 4
                        },
                        {
                          "type": "text",
                          "text": `${member.MemberType}`,
                          "wrap": true,
                          "color": "#666666",
                          "size": "sm",
                          "flex": 4
                        }
                      ]
                    },
                    ...dateBoxes
                  ]
                },
                {
                  "type": "separator",
                  "margin": "md"
                },
                {
                  "type": "text",
                  "text": "ข้อมูลติดต่อ",
                  "margin": "md",
                  "weight": "bold",
                  "size": "md"
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": "เบอร์โทรศัพท์:",
                          "color": "#aaaaaa",
                          "size": "sm",
                          "flex": 4,
                          "wrap": true
                        },
                        {
                          "type": "text",
                          "text": `0${member.Phone}`,
                          "wrap": true,
                          "color": "#666666",
                          "size": "sm",
                          "flex": 4
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": "ที่อยู่:",
                          "color": "#aaaaaa",
                          "size": "sm",
                          "flex": 4
                        },
                        {
                          "type": "text",
                          "text": `${member.Address}`,
                          "wrap": true,
                          "color": "#666666",
                          "size": "sm",
                          "flex": 4
                        }
                      ]
                    }
                  ],
                  "margin": "sm"
                },
                {
                  "type": "separator",
                  "margin": "md"
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "หากข้อมูลไม่ถูกต้องหรือต้องการเปลี่ยนแปลง แจ้งแก้ไขเข้ามาได้เลยครับ ขอบคุณครับ",
                  "size": "xxs",
                  "wrap": true,
                  "color": "#aaaaaa",
                  "align": "center"
                }
              ]
            }
          }
        };
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [flexMsg],
        });
      }
    } catch (error) {
      console.error(error);
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: "เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง",
      });
    }
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
