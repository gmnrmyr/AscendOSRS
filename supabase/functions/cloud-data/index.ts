// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CRITICAL: Only these 4 categories are valid in database
const VALID_BANK_CATEGORIES = ['stackable', 'gear', 'materials', 'other'] as const;

// Bulletproof category validation - ensures ONLY valid categories
const validateBankCategory = (category: string): string => {
  if (!category || typeof category !== 'string') {
    console.log(`Invalid category type: ${typeof category}, value: ${category} -> defaulting to 'other'`);
    return 'other';
  }
  
  const normalized = category.toLowerCase().trim();
  
  // Direct match first
  if (VALID_BANK_CATEGORIES.includes(normalized as any)) {
    return normalized;
  }
  
  // Comprehensive category mappings
  const categoryMap: Record<string, string> = {
    // Stackable items
    'consumables': 'stackable',
    'consumable': 'stackable',
    'food': 'stackable',
    'potion': 'stackable',
    'potions': 'stackable',
    'coins': 'stackable',
    'coin': 'stackable',
    'token': 'stackable',
    'tokens': 'stackable',
    'rune': 'stackable',
    'runes': 'stackable',
    'bolt': 'stackable',
    'bolts': 'stackable',
    'arrow': 'stackable',
    'arrows': 'stackable',
    'ammunition': 'stackable',
    'ammo': 'stackable',
    
    // Gear items
    'weapon': 'gear',
    'weapons': 'gear',
    'armor': 'gear',
    'armour': 'gear',
    'equipment': 'gear',
    'helmet': 'gear',
    'helm': 'gear',
    'shield': 'gear',
    'gloves': 'gear',
    'boots': 'gear',
    'ring': 'gear',
    'rings': 'gear',
    'amulet': 'gear',
    'necklace': 'gear',
    'bracelet': 'gear',
    'cape': 'gear',
    'cloak': 'gear',
    
    // Materials
    'material': 'materials',
    'resource': 'materials',
    'resources': 'materials',
    'log': 'materials',
    'logs': 'materials',
    'ore': 'materials',
    'ores': 'materials',
    'bar': 'materials',
    'bars': 'materials',
    'gem': 'materials',
    'gems': 'materials',
    'herb': 'materials',
    'herbs': 'materials',
    'seed': 'materials',
    'seeds': 'materials',
    'essence': 'materials',
    'raw': 'materials',
    
    // Other items
    'misc': 'other',
    'miscellaneous': 'other',
    'quest': 'other',
    'key': 'other',
    'keys': 'other',
    'book': 'other',
    'books': 'other',
    'tool': 'other',
    'tools': 'other'
  };
  
  const mappedCategory = categoryMap[normalized];
  if (mappedCategory) {
    console.log(`Mapped category: ${category} -> ${mappedCategory}`);
    return mappedCategory;
  }
  
  console.log(`Unknown category: ${category} -> defaulting to 'other'`);
  return 'other';
}

// Safe number conversion
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
}

// Safe string conversion
const safeString = (value: any, maxLength: number = 1000): string => {
  if (value === null || value === undefined) return '';
  return String(value).substring(0, maxLength);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Edge Function called with method:', req.method)
    console.log('🔗 Request URL:', req.url)
    
    // Parse request body with better error handling
    let body;
    try {
      body = await req.json()
      console.log('📝 Request body parsed successfully:', JSON.stringify(body, null, 2))
    } catch (jsonError) {
      console.error('❌ JSON parsing error:', jsonError)
      return new Response(
        JSON.stringify({ 
          error: 'INVALID_JSON',
          message: 'Invalid JSON in request body',
          details: jsonError.message 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { action, bankOnly = false } = body
    console.log('🎯 Action:', action, 'Bank-only:', bankOnly)

    // Simple test endpoint that doesn't require auth
    if (action === 'test') {
      console.log('✅ Test endpoint called successfully')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Edge Function is working!',
          timestamp: new Date().toISOString(),
          receivedAction: action
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('🔐 Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('❌ No authorization header')
      return new Response(
        JSON.stringify({ 
          error: 'NO_AUTH_HEADER',
          message: 'No authorization header provided'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔧 Creating Supabase client...')
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    console.log('👤 Getting user from auth header...')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError) {
      console.error('❌ User authentication error:', userError)
      return new Response(
        JSON.stringify({ 
          error: 'AUTH_ERROR',
          message: 'User authentication failed', 
          details: userError.message 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (!user) {
      console.error('❌ No user found in auth response')
      return new Response(
        JSON.stringify({ 
          error: 'NO_USER',
          message: 'No user found in authentication response'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ User authenticated successfully:', user.id)

    if (action === 'save') {
      const { characters, moneyMethods, purchaseGoals, bankData, hoursPerDay, forceOverwrite } = body

      console.log('Starting cloud save for user:', user.id)
      console.log('Bank-only mode:', bankOnly)
      console.log('Force overwrite:', forceOverwrite)
      console.log('Data counts:', {
        characters: characters?.length || 0,
        moneyMethods: moneyMethods?.length || 0,
        purchaseGoals: purchaseGoals?.length || 0,
        bankItems: Object.values(bankData || {}).flat().length
      })

      let saveResults = {
        characters: 0,
        moneyMethods: 0,
        purchaseGoals: 0,
        bankItems: 0
      }

      // DATA PROTECTION: Check if we're about to save empty data
      const totalCharacters = characters?.length || 0
      const totalMethods = moneyMethods?.length || 0
      const totalGoals = purchaseGoals?.length || 0
      const totalBankItems = Object.values(bankData || {}).flat().length
      const hasAnyData = totalCharacters > 0 || totalMethods > 0 || totalGoals > 0 || totalBankItems > 0

      if (!bankOnly && !hasAnyData && !forceOverwrite) {
        console.error('❌ DATA PROTECTION: Attempted to save empty data without force override')
        return new Response(
          JSON.stringify({ 
            error: 'DATA_PROTECTION_ERROR',
            message: 'Cannot save empty data. This would erase all your existing data. Use forceOverwrite=true to override.',
            code: 'EMPTY_DATA_PROTECTION',
            details: {
              totalCharacters,
              totalMethods,
              totalGoals,
              totalBankItems,
              hasAnyData
            }
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // VERSIONING: Create snapshot before making changes (only if not bank-only mode)
      let snapshotId = null
      if (!bankOnly) {
        try {
          console.log('🔄 Creating data snapshot before save...')
          const snapshotResult = await supabaseClient.rpc('create_data_snapshot_before_save', {
            target_user_id: user.id,
            snapshot_type: 'auto'
          })
          snapshotId = snapshotResult.data
          if (snapshotId) {
            console.log('✅ Data snapshot created:', snapshotId)
          } else {
            console.log('ℹ️ No snapshot created (no existing data to backup)')
          }
        } catch (snapshotError) {
          console.warn('⚠️ Failed to create snapshot, continuing with save:', snapshotError)
        }
      }

      // CRITICAL FIX: Only clear existing data if NOT in bank-only mode
      if (!bankOnly) {
        console.log('Clearing existing user data...')
        try {
          await Promise.all([
            supabaseClient.from('characters').delete().eq('user_id', user.id),
            supabaseClient.from('money_methods').delete().eq('user_id', user.id),  
            supabaseClient.from('purchase_goals').delete().eq('user_id', user.id),
            supabaseClient.from('bank_items').delete().eq('user_id', user.id)
          ])
          console.log('Existing data cleared successfully')
        } catch (deleteError) {
          console.warn('Some delete operations failed, continuing anyway:', deleteError)
        }
      } else {
        console.log('Bank-only mode: Not clearing existing data, only adding bank items')
      }

      // Save characters
      if (Array.isArray(characters) && characters.length > 0) {
        console.log(`Saving ${characters.length} characters...`)
        const charactersToInsert = characters.map((char: any) => ({
          user_id: user.id,
          name: safeString(char.name || 'Unnamed Character', 100),
          type: ['main', 'alt', 'ironman', 'hardcore', 'ultimate'].includes(char.type) ? char.type : 'main',
          combat_level: Math.max(3, Math.min(126, safeNumber(char.combatLevel, 3))),
          total_level: Math.max(32, Math.min(2277, safeNumber(char.totalLevel, 32))),
          bank: Math.max(0, safeNumber(char.bank, 0)),
          notes: safeString(char.notes, 1000),
          plat_tokens: Math.max(0, safeNumber(char.platTokens, 0)),
          is_active: typeof char.isActive === 'boolean' ? char.isActive : true
        }))

        const { data: charData, error: charactersError } = await supabaseClient
          .from('characters')
          .insert(charactersToInsert)
          .select()
        
        if (charactersError) {
          console.error('Error saving characters:', charactersError)
          throw new Error(`Failed to save characters: ${charactersError.message}`)
        }
        saveResults.characters = charData?.length || 0
        console.log(`${saveResults.characters} characters saved successfully`)
      }

      // Save money methods
      if (Array.isArray(moneyMethods) && moneyMethods.length > 0) {
        console.log(`Saving ${moneyMethods.length} money methods...`)
        const methodsToInsert = moneyMethods.map((method: any) => {
          const baseMethod = {
            user_id: user.id,
            name: safeString(method.name || 'Unnamed Method', 100),
            character: safeString(method.character || 'Unknown', 100),
            gp_hour: Math.max(0, safeNumber(method.gpHour, 0)),
            click_intensity: Math.min(Math.max(safeNumber(method.clickIntensity, 1), 1), 5),
            requirements: safeString(method.requirements, 500),
            notes: safeString(method.notes, 1000),
            category: ['combat', 'skilling', 'bossing', 'other'].includes(method.category) ? method.category : 'other'
          };
          
          // Only add is_active if the method has the property
          if (method.hasOwnProperty('isActive')) {
            return {
              ...baseMethod,
              is_active: method.isActive === true
            };
          }
          
          return baseMethod;
        })

        console.log('Attempting to insert money methods:', JSON.stringify(methodsToInsert, null, 2))
        
        const { data: methodData, error: methodsError } = await supabaseClient
          .from('money_methods')
          .insert(methodsToInsert)
          .select()
        
        if (methodsError) {
          console.error('Error saving money methods:', methodsError)
          console.error('Methods that failed to insert:', JSON.stringify(methodsToInsert, null, 2))
          throw new Error(`Failed to save money methods: ${methodsError.message}`)
        }
        saveResults.moneyMethods = methodData?.length || 0
        console.log(`${saveResults.moneyMethods} money methods saved successfully`)
      }

      // Save hoursPerDay to user_settings table (best practice)
      if (typeof hoursPerDay === 'number') {
        const { error: upsertError } = await supabaseClient
          .from('user_settings')
          .upsert({ user_id: user.id, hours_per_day: hoursPerDay }, { onConflict: ['user_id'] });
        if (upsertError) {
          console.error('Error saving hoursPerDay to user_settings:', upsertError);
        }
      }

      // Save purchase goals
      if (Array.isArray(purchaseGoals) && purchaseGoals.length > 0) {
        console.log(`Saving ${purchaseGoals.length} purchase goals...`)
        const goalsToInsert = purchaseGoals.map((goal: any) => ({
          user_id: user.id,
          name: safeString(goal.name || 'Unnamed Goal', 100),
          current_price: Math.max(0, safeNumber(goal.currentPrice, 0)),
          target_price: goal.targetPrice ? Math.max(0, safeNumber(goal.targetPrice, 0)) : null,
          quantity: Math.max(1, safeNumber(goal.quantity, 1)),
          priority: ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-'].includes(goal.priority) ? goal.priority : 'A',
          category: ['gear', 'consumables', 'materials', 'other'].includes(goal.category) ? goal.category : 'other',
          notes: safeString(goal.notes, 1000),
          image_url: safeString(goal.imageUrl, 500)
        }))

        const { data: goalData, error: goalsError } = await supabaseClient
          .from('purchase_goals')
          .insert(goalsToInsert)
          .select()
        
        if (goalsError) {
          console.error('Error saving purchase goals:', goalsError)
          throw new Error(`Failed to save purchase goals: ${goalsError.message}`)
        }
        saveResults.purchaseGoals = goalData?.length || 0
        console.log(`${saveResults.purchaseGoals} purchase goals saved successfully`)
      }

      // Save bank items with bulletproof validation and value prioritization
      if (bankData && typeof bankData === 'object') {
        const allBankItems = Object.entries(bankData).flatMap(([character, items]: [string, any]) => 
          Array.isArray(items) ? items.map((item: any) => ({ ...item, characterName: character })) : []
        );
        
        if (allBankItems.length > 0) {
          console.log(`Processing ${allBankItems.length} bank items...`)
          
          // CRITICAL: If in bank-only mode, clear existing bank items for these specific characters first
          if (bankOnly) {
            const charactersToUpdate = Object.keys(bankData).filter(char => 
              Array.isArray(bankData[char]) && bankData[char].length > 0
            );
            
            if (charactersToUpdate.length > 0) {
              console.log(`Bank-only mode: Clearing existing bank items for characters: ${charactersToUpdate.join(', ')}`);
              
              try {
                // Clear bank items for these specific characters only
                const { error: clearError } = await supabaseClient
                  .from('bank_items')
                  .delete()
                  .eq('user_id', user.id)
                  .in('character', charactersToUpdate);
                
                if (clearError) {
                  console.error('Error clearing character bank items:', clearError);
                  throw new Error(`Failed to clear character bank items: ${clearError.message}`);
                }
                
                console.log(`Successfully cleared bank items for characters: ${charactersToUpdate.join(', ')}`);
              } catch (clearError) {
                console.error('Failed to clear character bank items:', clearError);
                throw clearError;
              }
            }
          }
          
          const bankItemsToInsert = allBankItems
            .filter((item: any) => {
              const hasValidName = item && typeof item === 'object' && item.name && String(item.name).trim();
              if (!hasValidName) {
                console.log(`Skipping invalid item:`, item);
              }
              return hasValidName;
            })
            .map((item: any) => {
              const validatedCategory = validateBankCategory(item.category);
              const quantity = Math.max(0, safeNumber(item.quantity, 0));
              const estimatedPrice = Math.max(0, safeNumber(item.estimatedPrice, 0));
              
              // Double-check the category is valid
              if (!VALID_BANK_CATEGORIES.includes(validatedCategory as any)) {
                console.error(`CRITICAL: Invalid category after validation: ${validatedCategory}`);
                return null;
              }
              
              return {
                user_id: user.id,
                name: safeString(item.name, 100).trim(),
                quantity: quantity,
                estimated_price: estimatedPrice,
                category: validatedCategory,
                character: safeString(item.characterName || item.character || 'Unknown', 100),
                totalValue: quantity * estimatedPrice // Add total value for sorting
              };
            })
            .filter(item => item !== null)
            .sort((a: any, b: any) => {
              // Sort by total value (descending) - most valuable items first
              const valueA = a.totalValue || 0;
              const valueB = b.totalValue || 0;
              if (valueB !== valueA) {
                return valueB - valueA;
              }
              // Secondary sort by item name for consistency
              return a.name.localeCompare(b.name);
            })
            .map(item => {
              // Remove totalValue before inserting to database
              const { totalValue, ...itemForDb } = item;
              return itemForDb;
            });

          console.log(`Attempting to insert ${bankItemsToInsert.length} validated bank items (sorted by value)...`)
          
          // Log the top 5 most valuable items being saved
          console.log('Top 5 most valuable items being saved:');
          const topItems = allBankItems
            .map(item => ({
              name: item.name,
              quantity: safeNumber(item.quantity, 0),
              price: safeNumber(item.estimatedPrice, 0),
              character: item.characterName || item.character
            }))
            .filter(item => item.name)
            .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
            .slice(0, 5);
          
          topItems.forEach((item, index) => {
            const totalValue = item.quantity * item.price;
            console.log(`  ${index + 1}. ${item.name} (${item.character}) - ${item.quantity.toLocaleString()} x ${item.price.toLocaleString()} = ${totalValue.toLocaleString()} GP`);
          });
          
          if (bankItemsToInsert.length > 0) {
            // Optimized batch parameters for character-by-character saves
            const batchSize = 75; // Reduced from 100 to 75 for better reliability
            let totalInserted = 0;
            const maxRetries = 5; // Keep 5 retries
            
            console.log(`Processing ${bankItemsToInsert.length} items in batches of ${batchSize}...`);
            
            for (let i = 0; i < bankItemsToInsert.length; i += batchSize) {
              const batch = bankItemsToInsert.slice(i, i + batchSize);
              const batchNumber = Math.floor(i/batchSize) + 1;
              const totalBatches = Math.ceil(bankItemsToInsert.length/batchSize);
              
              console.log(`Inserting batch ${batchNumber}/${totalBatches} with ${batch.length} items (items ${i + 1}-${Math.min(i + batchSize, bankItemsToInsert.length)})`);
              
              // Log first few items in batch for debugging
              batch.slice(0, 2).forEach((item, index) => {
                console.log(`  Item ${index + 1}: ${item.name} (${item.character}) - Qty: ${item.quantity}`);
              });
              if (batch.length > 2) {
                console.log(`  ... and ${batch.length - 2} more items in this batch`);
              }
              
              // Retry logic for each batch
              let batchInserted = 0;
              let retryCount = 0;
              
              while (retryCount < maxRetries) {
                try {
                  const { data: bankData, error: bankError } = await supabaseClient
                    .from('bank_items')
                    .insert(batch)
                    .select();
                  
                  if (bankError) {
                    throw bankError;
                  }
                  
                  batchInserted = bankData?.length || 0;
                  console.log(`Batch ${batchNumber} inserted ${batchInserted} items successfully`);
                  break; // Success, exit retry loop
                  
                } catch (batchError) {
                  retryCount++;
                  console.error(`Error saving batch ${batchNumber}, attempt ${retryCount}:`, batchError);
                  
                  if (retryCount >= maxRetries) {
                    // Final attempt failed, try individual saves for critical items
                    console.error(`Failed to save batch ${batchNumber} after ${maxRetries} attempts:`);
                    console.error('Failed batch error:', batchError.message);
                    
                    // For failed batches, try to save the most valuable items individually
                    console.log(`Attempting to save most valuable items from batch ${batchNumber} individually...`);
                    
                    // Sort this batch by value and try to save the top items
                    const sortedBatch = batch
                      .map(item => ({
                        ...item,
                        totalValue: item.quantity * item.estimated_price
                      }))
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .slice(0, Math.min(15, batch.length)); // Try top 15 items from failed batch (reduced from 20)
                    
                    for (const item of sortedBatch) {
                      try {
                        const { totalValue, ...itemForDb } = item;
                        const { data: singleData, error: singleError } = await supabaseClient
                          .from('bank_items')
                          .insert([itemForDb])
                          .select();
                        
                        if (!singleError && singleData?.length > 0) {
                          batchInserted++;
                          console.log(`Individual save successful: ${item.name} (${item.totalValue.toLocaleString()} GP)`);
                        } else {
                          console.error(`Individual save failed for ${item.name}:`, singleError?.message);
                        }
                        
                        // Small delay between individual saves
                        await new Promise(resolve => setTimeout(resolve, 50));
                      } catch (individualError) {
                        console.error(`Individual save exception for ${item.name}:`, individualError);
                      }
                    }
                    
                    console.log(`Batch ${batchNumber} individual saves completed: ${batchInserted} items saved`);
                    break; // Exit retry loop
                  } else {
                    // Wait before retrying with exponential backoff
                    const waitTime = 1000 * Math.pow(2, retryCount - 1); // 1s, 2s, 4s, 8s, 16s
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    console.log(`Retrying batch ${batchNumber} in ${waitTime}ms...`);
                  }
                }
              }
              
              totalInserted += batchInserted;
              console.log(`Running total: ${totalInserted}/${bankItemsToInsert.length} items saved (${((totalInserted/bankItemsToInsert.length)*100).toFixed(1)}%)`);
              
              // Increased delay between batches for character-by-character saves
              if (i + batchSize < bankItemsToInsert.length) {
                await new Promise(resolve => setTimeout(resolve, 200)); // Increased from 100ms to 200ms
              }
            }
            
            saveResults.bankItems = totalInserted;
            console.log(`${saveResults.bankItems} bank items saved successfully out of ${bankItemsToInsert.length} attempted`);
            
            // Detailed reporting
            if (totalInserted < bankItemsToInsert.length) {
              const missingCount = bankItemsToInsert.length - totalInserted;
              const successRate = ((totalInserted / bankItemsToInsert.length) * 100).toFixed(1);
              console.warn(`WARNING: Only ${totalInserted} out of ${bankItemsToInsert.length} bank items were saved (${successRate}% success rate)`);
              console.warn(`${missingCount} items failed to save. Most valuable items were prioritized.`);
            }
          }
        }
      }

      // Verify the save actually worked by checking the database
      const [charCheck, methodCheck, goalCheck, bankCheck] = await Promise.all([
        supabaseClient.from('characters').select('id').eq('user_id', user.id),
        supabaseClient.from('money_methods').select('id').eq('user_id', user.id),
        supabaseClient.from('purchase_goals').select('id').eq('user_id', user.id),
        supabaseClient.from('bank_items').select('id').eq('user_id', user.id)
      ]);

      const actualCounts = {
        characters: charCheck.data?.length || 0,
        moneyMethods: methodCheck.data?.length || 0,
        purchaseGoals: goalCheck.data?.length || 0,
        bankItems: bankCheck.data?.length || 0
      };

      console.log('Verification - Expected vs Actual counts:');
      console.log('Characters:', saveResults.characters, 'vs', actualCounts.characters);
      console.log('Money Methods:', saveResults.moneyMethods, 'vs', actualCounts.moneyMethods);
      console.log('Purchase Goals:', saveResults.purchaseGoals, 'vs', actualCounts.purchaseGoals);
      console.log('Bank Items:', saveResults.bankItems, 'vs', actualCounts.bankItems);

      // Update save results with actual counts
      saveResults = actualCounts;

      console.log('Cloud save completed successfully for user:', user.id);
      console.log('Final save results:', saveResults);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Data saved successfully',
          saved: saveResults,
          snapshot: snapshotId ? { id: snapshotId, created: true } : { created: false }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'list_snapshots') {
      console.log('Listing snapshots for user:', user.id)
      
      try {
        const { data: snapshots, error: snapshotsError } = await supabaseClient
          .from('data_snapshots')
          .select('id, version_number, snapshot_type, data_summary, created_at')
          .eq('user_id', user.id)
          .order('version_number', { ascending: false })
          .limit(10)
        
        if (snapshotsError) {
          console.error('List snapshots error details:', snapshotsError)
          
          // Handle missing table gracefully with broader error detection
          if (snapshotsError.message?.includes('does not exist') ||
              snapshotsError.message?.includes('data_snapshots') ||
              snapshotsError.code === 'PGRST116' ||
              snapshotsError.code === '42P01') {
            console.warn('⚠️ Versioning tables not yet created. Run the manual migration.')
            return new Response(
              JSON.stringify({ 
                success: true, 
                snapshots: [],
                migrationRequired: true,
                warning: 'Versioning system not yet initialized. Please run the database migration.'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          throw new Error(`Failed to load snapshots: ${snapshotsError.message}`)
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            snapshots: snapshots || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('List snapshots error:', error)
        return new Response(
          JSON.stringify({ 
            success: true, 
            snapshots: [],
            warning: 'Versioning system not available. Please run the database migration.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
    } else if (action === 'restore_snapshot') {
      const { snapshotId } = body
      console.log('Restoring snapshot:', snapshotId, 'for user:', user.id)
      
      const { data: snapshotData, error: restoreError } = await supabaseClient
        .rpc('restore_from_snapshot', { snapshot_id: snapshotId })
      
      if (restoreError) {
        throw new Error(`Failed to restore snapshot: ${restoreError.message}`)
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: snapshotData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
      
    } else if (action === 'create_manual_snapshot') {
      console.log('Creating manual snapshot for user:', user.id)
      
      try {
        // First, let's verify the table exists
        console.log('🔍 Checking if data_snapshots table exists...')
        const { data: tableCheck, error: tableError } = await supabaseClient
          .from('data_snapshots')
          .select('id')
          .limit(1)
        
        if (tableError) {
          console.error('❌ Table check failed:', tableError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'MIGRATION_REQUIRED',
              message: `Table not found: ${tableError.message}. Please run the database migration.`,
              migrationRequired: true,
              snapshot: { id: null, created: false },
              debugInfo: {
                tableError: tableError.message,
                code: tableError.code
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        console.log('✅ Table exists, now checking function...')
        
        // Now try to call the function
        const { data: snapshotId, error: snapshotError } = await supabaseClient
          .rpc('create_data_snapshot_before_save', {
            target_user_id: user.id,
            snapshot_type: 'manual'
          })
        
        if (snapshotError) {
          console.error('❌ Function call failed:', snapshotError)
          
          // Enhanced error detection with full error details
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'FUNCTION_ERROR',
              message: `Function error: ${snapshotError.message}. The function may not exist or have an error.`,
              migrationRequired: true,
              snapshot: { id: null, created: false },
              debugInfo: {
                functionError: snapshotError.message,
                code: snapshotError.code,
                hint: snapshotError.hint,
                details: snapshotError.details
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        console.log('✅ Snapshot created successfully:', snapshotId)
        return new Response(
          JSON.stringify({ 
            success: true, 
            snapshot: { id: snapshotId, created: true }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('💥 Unexpected error in create_manual_snapshot:', error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'UNEXPECTED_ERROR',
            message: `Unexpected error: ${error.message}`,
            snapshot: { id: null, created: false },
            debugInfo: {
              errorType: error.constructor.name,
              errorMessage: error.message,
              stack: error.stack
            }
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
    } else if (action === 'verify_migration') {
      console.log('🔍 Verifying migration status for user:', user.id)
      
      const verificationResults = {
        tableExists: false,
        functionExists: false,
        canCreateSnapshot: false,
        errors: []
      }
      
      try {
        // Test 1: Check if table exists
        console.log('📋 Testing data_snapshots table...')
        const { data: tableTest, error: tableError } = await supabaseClient
          .from('data_snapshots')
          .select('id')
          .limit(1)
        
        if (tableError) {
          verificationResults.errors.push(`Table error: ${tableError.message}`)
        } else {
          verificationResults.tableExists = true
          console.log('✅ Table exists')
        }
        
        // Test 2: Check if function exists
        console.log('⚙️ Testing create_data_snapshot_before_save function...')
        const { data: functionTest, error: functionError } = await supabaseClient
          .rpc('create_data_snapshot_before_save', {
            target_user_id: user.id,
            snapshot_type: 'manual'
          })
        
        if (functionError) {
          verificationResults.errors.push(`Function error: ${functionError.message}`)
        } else {
          verificationResults.functionExists = true
          verificationResults.canCreateSnapshot = true
          console.log('✅ Function works, test snapshot created:', functionTest)
        }
        
      } catch (error) {
        verificationResults.errors.push(`Verification error: ${error.message}`)
      }
      
      console.log('🔍 Verification complete:', verificationResults)
      
      return new Response(
        JSON.stringify({ 
          success: true,
          migrationStatus: verificationResults,
          message: verificationResults.canCreateSnapshot 
            ? 'Migration successful! Versioning system is ready.' 
            : 'Migration incomplete. Please run the SQL script again.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
      
    } else if (action === 'load') {
      // Load user data
      console.log('Loading cloud data for user:', user.id)

      const [charactersResult, methodsResult, goalsResult, bankResult] = await Promise.all([
        supabaseClient.from('characters').select('*').eq('user_id', user.id),
        supabaseClient.from('money_methods').select('*').eq('user_id', user.id),
        supabaseClient.from('purchase_goals').select('*').eq('user_id', user.id),
        supabaseClient.from('bank_items').select('*').eq('user_id', user.id)
      ])

      if (charactersResult.error) throw new Error(`Failed to load characters: ${charactersResult.error.message}`)
      if (methodsResult.error) throw new Error(`Failed to load money methods: ${methodsResult.error.message}`)
      if (goalsResult.error) throw new Error(`Failed to load goals: ${goalsResult.error.message}`)
      if (bankResult.error) throw new Error(`Failed to load bank items: ${bankResult.error.message}`)

      // Transform data back to frontend format
      const characters = (charactersResult.data || []).map(char => ({
        id: char.id,
        name: char.name,
        type: char.type,
        combatLevel: safeNumber(char.combat_level, 0),
        totalLevel: safeNumber(char.total_level, 0),
        bank: safeNumber(char.bank, 0),
        notes: char.notes || '',
        isActive: typeof char.is_active === 'boolean' ? char.is_active : true,
        platTokens: safeNumber(char.plat_tokens, 0)
      }))

      const moneyMethods = (methodsResult.data || []).map(method => ({
        id: method.id,
        name: method.name,
        character: method.character,
        gpHour: safeNumber(method.gp_hour, 0),
        clickIntensity: method.click_intensity,
        requirements: method.requirements || '',
        notes: method.notes || '',
        category: method.category,
        membership: method.is_member === true ? 'p2p' : 'f2p',
        isActive: method.is_active === true
      }))

      const purchaseGoals = (goalsResult.data || []).map(goal => ({
        id: goal.id,
        name: goal.name,
        currentPrice: safeNumber(goal.current_price, 0),
        targetPrice: goal.target_price ? safeNumber(goal.target_price, 0) : undefined,
        quantity: safeNumber(goal.quantity, 1),
        priority: goal.priority,
        category: goal.category,
        notes: goal.notes || '',
        imageUrl: goal.image_url || ''
      }))

      // Group bank items by character
      const bankData: Record<string, any[]> = {}
      const bankItems = (bankResult.data || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: safeNumber(item.quantity, 0),
        estimatedPrice: safeNumber(item.estimated_price, 0),
        category: item.category,
        character: item.character
      }))

      bankItems.forEach(item => {
        if (!bankData[item.character]) {
          bankData[item.character] = []
        }
        bankData[item.character].push(item)
      })

      console.log('Cloud data loaded successfully for user:', user.id)
      console.log('Loaded counts:', {
        characters: characters.length,
        moneyMethods: moneyMethods.length,
        purchaseGoals: purchaseGoals.length,
        bankItems: bankItems.length
      })
      
      // Load hoursPerDay from user_settings table (best practice)
      let hoursPerDay = 10;
      const { data: settingsData, error: settingsError } = await supabaseClient
        .from('user_settings')
        .select('hours_per_day')
        .eq('user_id', user.id)
        .single();
      if (!settingsError && settingsData && typeof settingsData.hours_per_day === 'number') {
        hoursPerDay = settingsData.hours_per_day;
      }
      return new Response(
        JSON.stringify({
          characters,
          moneyMethods,
          purchaseGoals,
          bankData,
          hoursPerDay
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in cloud-data function:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString(),
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
