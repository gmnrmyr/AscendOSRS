
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
      await Promise.all([
        supabaseClient.from('characters').delete().eq('user_id', user.id),
        supabaseClient.from('money_methods').delete().eq('user_id', user.id),  
        supabaseClient.from('purchase_goals').delete().eq('user_id', user.id),
        supabaseClient.from('bank_items').delete().eq('user_id', user.id)
      ])

      // Save characters
      if (characters && characters.length > 0) {
        const { error: charactersError } = await supabaseClient.from('characters').insert(
          characters.map((char: any) => ({
            user_id: user.id,
            name: char.name,
            type: char.type,
            combat_level: char.combatLevel || 0,
            total_level: char.totalLevel || 0,
            bank: char.bank || 0,
            notes: char.notes || ''
          }))
        )
        if (charactersError) {
          console.error('Error saving characters:', charactersError)
          throw charactersError
        }
      }

      // Save money methods
      if (moneyMethods && moneyMethods.length > 0) {
        const { error: methodsError } = await supabaseClient.from('money_methods').insert(
          moneyMethods.map((method: any) => ({
            user_id: user.id,
            name: method.name,
            character: method.character,
            gp_hour: method.gpHour || 0,
            click_intensity: method.clickIntensity || 1,
            requirements: method.requirements || '',
            notes: method.notes || '',
            category: method.category
          }))
        )
        if (methodsError) {
          console.error('Error saving money methods:', methodsError)
          throw methodsError
        }
      }

      // Save purchase goals
      if (purchaseGoals && purchaseGoals.length > 0) {
        const { error: goalsError } = await supabaseClient.from('purchase_goals').insert(
          purchaseGoals.map((goal: any) => ({
            user_id: user.id,
            name: goal.name,
            current_price: goal.currentPrice || 0,
            target_price: goal.targetPrice,
            quantity: goal.quantity || 1,
            priority: goal.priority,
            category: goal.category,
            notes: goal.notes || '',
            image_url: goal.imageUrl || ''
          }))
        )
        if (goalsError) {
          console.error('Error saving purchase goals:', goalsError)
          throw goalsError
        }
      }

      // Save bank items
      if (bankData) {
        const allBankItems = Object.values(bankData).flat()
        if (allBankItems.length > 0) {
          const { error: bankError } = await supabaseClient.from('bank_items').insert(
            allBankItems.map((item: any) => ({
              user_id: user.id,
              name: item.name,
              quantity: item.quantity || 0,
              estimated_price: item.estimatedPrice || 0,
              category: item.category,
              character: item.character
            }))
          )
          if (bankError) {
            console.error('Error saving bank items:', bankError)
            throw bankError
          }
        }
      }

      console.log('Cloud save completed successfully')
      
      return new Response(
        JSON.stringify({ success: true }),
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

      if (charactersResult.error) throw charactersResult.error
      if (methodsResult.error) throw methodsResult.error
      if (goalsResult.error) throw goalsResult.error
      if (bankResult.error) throw bankResult.error

      // Transform data
      const characters = (charactersResult.data || []).map(char => ({
        id: char.id,
        name: char.name,
        type: char.type,
        combatLevel: char.combat_level || 0,
        totalLevel: char.total_level || 0,
        bank: Number(char.bank) || 0,
        notes: char.notes || '',
        isActive: true
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
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
