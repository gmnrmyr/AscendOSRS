
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the Authorization header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { method } = req
    const body = method !== 'GET' ? await req.json() : null

    if (method === 'POST' && req.url.includes('/save')) {
      // Save user data
      const { characters, moneyMethods, purchaseGoals, bankData, hoursPerDay } = body

      console.log('Starting cloud save for user:', user.id)

      // Clear existing data first
      const deleteResults = await Promise.allSettled([
        supabaseClient.from('characters').delete().eq('user_id', user.id),
        supabaseClient.from('money_methods').delete().eq('user_id', user.id),  
        supabaseClient.from('purchase_goals').delete().eq('user_id', user.id),
        supabaseClient.from('bank_items').delete().eq('user_id', user.id)
      ])

      // Log any delete errors but continue
      deleteResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Delete operation ${index} failed:`, result.reason)
        }
      })

      // Save characters with proper validation
      if (characters && characters.length > 0) {
        const validCharacterTypes = ['main', 'alt', 'ironman', 'hardcore', 'ultimate'];
        const charactersToInsert = characters.map((char: any) => ({
          user_id: user.id,
          name: char.name || 'Unnamed Character',
          type: validCharacterTypes.includes(char.type) ? char.type : 'main',
          combat_level: Math.max(0, Math.min(126, char.combatLevel || 0)),
          total_level: Math.max(0, Math.min(2277, char.totalLevel || 0)),
          bank: Math.max(0, char.bank || 0),
          notes: char.notes || '',
          plat_tokens: Math.max(0, char.platTokens || 0)
        }))

        const { error: charactersError } = await supabaseClient
          .from('characters')
          .insert(charactersToInsert)
        
        if (charactersError) {
          console.error('Error saving characters:', charactersError)
          throw new Error(`Failed to save characters: ${charactersError.message}`)
        }
      }

      // Save money methods with proper validation
      if (moneyMethods && moneyMethods.length > 0) {
        const validCategories = ['combat', 'skilling', 'bossing', 'other'];
        const methodsToInsert = moneyMethods.map((method: any) => ({
          user_id: user.id,
          name: method.name || 'Unnamed Method',
          character: method.character || 'Unknown',
          gp_hour: Math.max(0, method.gpHour || 0),
          click_intensity: Math.min(Math.max(parseInt(method.clickIntensity) || 1, 1), 5),
          requirements: method.requirements || '',
          notes: method.notes || '',
          category: validCategories.includes(method.category) ? method.category : 'other'
        }))

        const { error: methodsError } = await supabaseClient
          .from('money_methods')
          .insert(methodsToInsert)
        
        if (methodsError) {
          console.error('Error saving money methods:', methodsError)
          throw new Error(`Failed to save money methods: ${methodsError.message}`)
        }
      }

      // Save purchase goals with proper validation
      if (purchaseGoals && purchaseGoals.length > 0) {
        const validGoalCategories = ['gear', 'consumables', 'materials', 'other'];
        const validPriorities = ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-'];
        const goalsToInsert = purchaseGoals.map((goal: any) => ({
          user_id: user.id,
          name: goal.name || 'Unnamed Goal',
          current_price: Math.max(0, goal.currentPrice || 0),
          target_price: goal.targetPrice ? Math.max(0, goal.targetPrice) : null,
          quantity: Math.max(1, goal.quantity || 1),
          priority: validPriorities.includes(goal.priority) ? goal.priority : 'A',
          category: validGoalCategories.includes(goal.category) ? goal.category : 'other',
          notes: goal.notes || '',
          image_url: goal.imageUrl || ''
        }))

        const { error: goalsError } = await supabaseClient
          .from('purchase_goals')
          .insert(goalsToInsert)
        
        if (goalsError) {
          console.error('Error saving purchase goals:', goalsError)
          throw new Error(`Failed to save purchase goals: ${goalsError.message}`)
        }
      }

      // Save bank items with proper validation
      if (bankData && typeof bankData === 'object') {
        const allBankItems = Object.entries(bankData).flatMap(([character, items]: [string, any]) => 
          Array.isArray(items) ? items.map((item: any) => ({ ...item, characterName: character })) : []
        );
        
        if (allBankItems.length > 0) {
          const validBankCategories = ['stackable', 'gear', 'materials', 'other'];
          const bankItemsToInsert = allBankItems.map((item: any) => ({
            user_id: user.id,
            name: item.name || 'Unknown Item',
            quantity: Math.max(0, item.quantity || 0),
            estimated_price: Math.max(0, item.estimatedPrice || 0),
            category: validBankCategories.includes(item.category) ? item.category : 'other',
            character: item.characterName || item.character || 'Unknown'
          }))

          const { error: bankError } = await supabaseClient
            .from('bank_items')
            .insert(bankItemsToInsert)
          
          if (bankError) {
            console.error('Error saving bank items:', bankError)
            throw new Error(`Failed to save bank items: ${bankError.message}`)
          }
        }
      }

      console.log('Cloud save completed successfully')
      
      return new Response(
        JSON.stringify({ success: true, message: 'Data saved successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (method === 'GET' && req.url.includes('/load')) {
      // Load user data
      console.log('Loading cloud data for user:', user.id)

      // Load all data in parallel
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
        combatLevel: char.combat_level || 0,
        totalLevel: char.total_level || 0,
        bank: Number(char.bank) || 0,
        notes: char.notes || '',
        isActive: true,
        platTokens: char.plat_tokens || 0
      }))

      const moneyMethods = (methodsResult.data || []).map(method => ({
        id: method.id,
        name: method.name,
        character: method.character,
        gpHour: method.gp_hour || 0,
        clickIntensity: method.click_intensity,
        requirements: method.requirements || '',
        notes: method.notes || '',
        category: method.category
      }))

      const purchaseGoals = (goalsResult.data || []).map(goal => ({
        id: goal.id,
        name: goal.name,
        currentPrice: goal.current_price || 0,
        targetPrice: goal.target_price,
        quantity: goal.quantity || 1,
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
        quantity: item.quantity || 0,
        estimatedPrice: item.estimated_price || 0,
        category: item.category,
        character: item.character
      }))

      bankItems.forEach(item => {
        if (!bankData[item.character]) {
          bankData[item.character] = []
        }
        bankData[item.character].push(item)
      })

      console.log('Cloud data loaded successfully')
      
      return new Response(
        JSON.stringify({
          characters,
          moneyMethods,
          purchaseGoals,
          bankData,
          hoursPerDay: 10
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in cloud-data function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
