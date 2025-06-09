// 直接设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://uigzgukxwlqmogwsfnku.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZ3pndWt4d2xxbW9nd3Nmbmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDQxNzQ0MywiZXhwIjoyMDM1OTkzNDQzfQ.SHBH-o4d5BZs1OZdQrwj32h1RGKlnKGz9IgGT2iIKT8';

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
  const testUserId = 'a245e0e0-9228-4854-8342-8e86a9aaa4b7';
  
  console.log('🔧 Creating test user...', testUserId);
  
  try {
    // 先检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('user_meta')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (existingUser) {
      console.log('👤 User already exists:', existingUser);
      return existingUser;
    }

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error checking user:', checkError);
      return;
    }

    // 创建用户记录
    const { data: newUser, error: insertError } = await supabase
      .from('user_meta')
      .insert({
        user_id: testUserId,
        username: '107060023',
        avatar_url: null,
        is_paid: false,
        plan_type: 'free',
        paid_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating user:', insertError);
      return;
    }

    console.log('✅ Test user created successfully:', newUser);
    return newUser;

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

createTestUser(); 