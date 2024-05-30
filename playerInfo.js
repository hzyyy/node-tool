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
  httpsAgent: new HttpsProxyAgent('http://127.0.0.1:7890')
};


axios.get(url, proxyConfig)
  .then(response => {
    // Step 2: Parse the webpage content
    const $ = cheerio.load(response.data);

    // Step 3: Extract players data
    let players = [];
    const table = $('#mw-content-text .mw-content-ltr div small table:eq(0)');
    
    console.log(table.find('tr td'));

    return

    table.find('tr td').each((index, element) => {
      const cols = $(element).find('td');
      
      let date = $(cols[2]).text().trim();
      
      console.log(date);
      // 提取日期
      const dateStr = date.match(/\d{4}年\d{1,2}月\d{1,2}日/)?.[0] || '';
      // 提取括号内容
      const bracketContent = date.match(/\((.*?)\)/)?.[1] || '';

      const player = {
        "号码": $(cols[0]).text().trim(),
        "姓名": $(cols[1]).find('.hauptlink').text().trim(),
        "出生日期": dateStr,
        "年龄": bracketContent
        // Position: $(cols[2]).text().trim(),
        // 'Date of Birth': $(cols[3]).text().trim(),
        // Nationality: $(cols[4]).find('img').attr('title'),
        // 'Market Value': $(cols[5]).text().trim()
      };

      players.push(player);
    });

    // Step 4: Convert to worksheet and workbook
    // const worksheet = xlsx.utils.json_to_sheet(players);
    // const workbook = xlsx.utils.book_new();
    // xlsx.utils.book_append_sheet(workbook, worksheet, 'Players');

    // // Step 5: Save to Excel
    // xlsx.writeFile(workbook, 'Guangzhou_Evergrande_Players.xlsx');

    // console.log("Data has been successfully saved to Guangzhou_Evergrande_Players.xlsx");
  })
  .catch(error => {
    console.error(`Error fetching the webpage: ${error.message}`);
  });