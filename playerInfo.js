const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const fs = require('fs');
const { HttpsProxyAgent } = require("https-proxy-agent");
const translatePromise = import('translate');
const url = 'https://zh.wikipedia.org/wiki/%E5%B9%BF%E5%B7%9E%E8%B6%B3%E7%90%83%E4%BF%B1%E4%B9%90%E9%83%A8#%E4%B8%80%E7%BA%BF%E9%98%9F%E5%90%8D%E5%8D%95';
const headers = { 'User-Agent': 'Mozilla/5.0' };

const proxyConfig = {
  headers,
  proxy: false,
  httpsAgent: new HttpsProxyAgent('http://127.0.0.1:2010')
};

axios.get(url, proxyConfig)
  .then(response => {
    const $ = cheerio.load(response.data);

    let players = [];
    const table = $('#mw-content-text .mw-content-ltr small table:eq(0)');
    
    table.find('tr').each((index, tr) => {
      let player = {};
      if(index == 0) {
        return true
      }

      
      let isPositionTr = $(tr).children('th').length > 0

      if(isPositionTr) {
        player['位置'] = $(tr).children('th').text().trim()
      } else {
        player = {
          ...player,
          "号码": $(tr).children('td:eq(0)').text().trim(),
          "国籍": $(tr).children('td:eq(1)').text().trim(),
          "姓名": $(tr).children('td:eq(2)').text().trim(),
          "出生日期": $(tr).children('td:eq(3)').text().trim(),
          "年龄": $(tr).children('td:eq(4)').text().trim(),
          "身高": $(tr).children('td:eq(5)').text().trim(),
          "体重": $(tr).children('td:eq(6)').text().trim(),
          "加盟年份": $(tr).children('td:eq(7)').text().trim(),
          "前属球队": $(tr).children('td:eq(8)').text().trim(),
          "身价": $(tr).children('td:eq(9)').text().trim(),
          "出生地": $(tr).children('td:eq(10)').text().trim(),
        }
      }

      players.push(player);
    });

    // Step 4: Convert to worksheet and workbook
    const worksheet = xlsx.utils.json_to_sheet(players);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Players');

    // Step 5: Save to Excel
    xlsx.writeFile(workbook, 'Guangzhou_Evergrande_Players.xlsx');

    // console.log("Data has been successfully saved to Guangzhou_Evergrande_Players.xlsx");
  })
  .catch(error => {
    console.error(`Error fetching the webpage: ${error.message}`);
  });