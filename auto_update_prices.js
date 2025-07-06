import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function autoUpdatePrices() {
  try {
    console.log('🚀 Starting automatic price update process...');
    
    // Step 1: Run the enhanced fix first
    console.log('📦 Step 1: Running enhanced price fix...');
    await execAsync('node enhanced_fix_prices.js');
    console.log('✅ Enhanced price fix completed');
    
    // Step 2: Run the full API update
    console.log('🌐 Step 2: Running full API price update...');
    await execAsync('node osrs_wiki_full_item_dump.js');
    console.log('✅ Full API price update completed');
    
    console.log('🎉 Automatic price update process completed successfully!');
    console.log('💰 Your items should now show correct prices!');
    
  } catch (error) {
    console.error('❌ Error during automatic update:', error);
    console.log('🔧 Falling back to enhanced fix only...');
    
    try {
      await execAsync('node enhanced_fix_prices.js');
      console.log('✅ Fallback enhanced fix completed');
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
  }
}

autoUpdatePrices(); 