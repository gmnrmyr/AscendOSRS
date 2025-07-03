// osrs_wiki_money_methods_scraper.js
// Node.js script to fetch and parse OSRS Wiki money making methods
// Usage: node osrs_wiki_money_methods_scraper.js > money_methods.json

import fs from 'fs';
import https from 'https';

// Function to fetch data from OSRS Wiki API with User-Agent
function fetchWikiData(title) {
  return new Promise((resolve, reject) => {
    const url = `https://oldschool.runescape.wiki/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&prop=text`;
    const options = {
      headers: {
        'User-Agent': 'osrs-dashboard-bot/1.0 (contact: your@email.com)'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Function to extract money making methods from HTML
function extractMoneyMethods(html) {
  const methods = [];
  
  // Split by table rows to find money making tables
  const tableMatches = html.match(/<table[^>]*class="wikitable"[^>]*>[\s\S]*?<\/table>/gi);
  
  if (tableMatches) {
    tableMatches.forEach(table => {
      // Extract rows from table
      const rowMatches = table.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
      
      if (rowMatches) {
        rowMatches.forEach((row, index) => {
          // Skip header rows
          if (index === 0) return;
          
          // Extract cells
          const cellMatches = row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi);
          
          if (cellMatches && cellMatches.length >= 3) {
            // Extract method name (usually first column)
            const nameMatch = cellMatches[0].match(/<t[dh][^>]*>([^<]+)<\/t[dh]>/);
            const name = nameMatch ? nameMatch[1].trim() : '';
            
            // Extract GP per hour (usually second or third column)
            let gpHour = 0;
            for (let i = 1; i < cellMatches.length; i++) {
              const gpMatch = cellMatches[i].match(/<t[dh][^>]*>([^<]+)<\/t[dh]>/);
              if (gpMatch) {
                const gpText = gpMatch[1].trim();
                // Look for numbers followed by k, m, or just numbers
                const gpNumberMatch = gpText.match(/(\d+(?:\.\d+)?)\s*(k|m|K|M)?/);
                if (gpNumberMatch) {
                  let number = parseFloat(gpNumberMatch[1]);
                  const multiplier = gpNumberMatch[2]?.toLowerCase();
                  if (multiplier === 'k') number *= 1000;
                  if (multiplier === 'm') number *= 1000000;
                  gpHour = Math.round(number);
                  break;
                }
              }
            }
            
            // Extract requirements (look for text in cells)
            let requirements = '';
            for (let i = 1; i < cellMatches.length; i++) {
              const reqMatch = cellMatches[i].match(/<t[dh][^>]*>([^<]+)<\/t[dh]>/);
              if (reqMatch) {
                const reqText = reqMatch[1].trim();
                if (reqText && !reqText.match(/^\d+/) && reqText.length > 3) {
                  requirements = reqText;
                  break;
                }
              }
            }
            
            // Determine category based on method name and requirements
            let category = 'other';
            const nameLower = name.toLowerCase();
            const reqLower = requirements.toLowerCase();
            
            if (nameLower.includes('dragon') || nameLower.includes('boss') || nameLower.includes('slayer') || 
                reqLower.includes('combat') || reqLower.includes('attack') || reqLower.includes('strength') ||
                reqLower.includes('defence') || reqLower.includes('ranged') || reqLower.includes('magic')) {
              category = 'combat';
            } else if (nameLower.includes('mining') || nameLower.includes('woodcutting') || nameLower.includes('fishing') ||
                       nameLower.includes('farming') || nameLower.includes('hunter') || nameLower.includes('thieving') ||
                       nameLower.includes('runecrafting') || nameLower.includes('crafting') || nameLower.includes('smithing') ||
                       nameLower.includes('cooking') || nameLower.includes('firemaking') || nameLower.includes('fletching') ||
                       nameLower.includes('herblore') || nameLower.includes('construction') || nameLower.includes('agility')) {
              category = 'skilling';
            } else if (nameLower.includes('collecting') || nameLower.includes('gathering') || nameLower.includes('pickpocket')) {
              category = 'collecting';
            }
            
            // Determine membership status
            let membership = 'f2p';
            if (nameLower.includes('(members)') || reqLower.includes('members') || 
                nameLower.includes('slayer') || nameLower.includes('farming') || nameLower.includes('hunter') ||
                nameLower.includes('thieving') || nameLower.includes('construction') || nameLower.includes('agility') ||
                nameLower.includes('herblore')) {
              membership = 'p2p';
            }
            
            if (name && gpHour > 0) {
              methods.push({
                name: name,
                gpHour: gpHour,
                requirements: requirements,
                category: category,
                membership: membership,
                notes: '',
                clickIntensity: 1 // Default to 1, users can adjust
              });
            }
          }
        });
      }
    });
  }
  
  return methods;
}

// Main function to scrape money making methods
async function scrapeMoneyMethods() {
  try {
    console.log('Fetching money making guide from OSRS Wiki...');
    
    // Fetch the main money making guide page
    const data = await fetchWikiData('Money_making_guide');
    
    if (data.parse && data.parse.text) {
      const html = data.parse.text['*'];
      // Debug: print a sample of the HTML
      console.log('--- HTML SAMPLE START ---');
      console.log(html.slice(0, 1000));
      console.log('--- HTML SAMPLE END ---');
      
      console.log('Extracting money making methods...');
      const methods = extractMoneyMethods(html);
      
      console.log(`Found ${methods.length} money making methods`);
      
      // Save to JSON file
      const outputData = {
        lastUpdated: new Date().toISOString(),
        source: 'OSRS Wiki - Money making guide',
        methods: methods
      };
      
      fs.writeFileSync('money_methods.json', JSON.stringify(outputData, null, 2));
      
      console.log('Money making methods saved to money_methods.json');
      console.log('\nSample methods:');
      methods.slice(0, 10).forEach((method, index) => {
        console.log(`${index + 1}. ${method.name} - ${method.gpHour.toLocaleString()} gp/hr (${method.category}, ${method.membership})`);
      });
      
      // Category breakdown
      const categoryCount = {};
      const membershipCount = {};
      
      methods.forEach(method => {
        categoryCount[method.category] = (categoryCount[method.category] || 0) + 1;
        membershipCount[method.membership] = (membershipCount[method.membership] || 0) + 1;
      });
      
      console.log('\nCategory breakdown:');
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} methods`);
      });
      
      console.log('\nMembership breakdown:');
      Object.entries(membershipCount).forEach(([membership, count]) => {
        console.log(`  ${membership}: ${count} methods`);
      });
      
    } else {
      console.error('Failed to parse wiki data');
    }
    
  } catch (error) {
    console.error('Error scraping money making methods:', error);
  }
}

// Run the scraper
scrapeMoneyMethods();
