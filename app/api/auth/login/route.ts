import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember_me: z.boolean().optional().default(false)
})

const DemoLoginSchema = z.object({
  demo: z.literal(true)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle demo login
    if (body.demo === true) {
      const demoCredentials = {
        email: 'demo@sentinelx.com',
        password: 'demo123'
      }
      
      const { data, error } = await supabase.auth.signInWithPassword(demoCredentials)
      
      if (error) {
        // If demo user doesn't exist, create it
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: demoCredentials.email,
          password: demoCredentials.password,
          options: {
            data: {
              full_name: 'Demo User',
              role: 'coordinator'
            }
          }
        })

        if (signUpError) {
          return NextResponse.json(
            { success: false, error: 'Failed to create demo user' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            user: signUpData.user,
            session: signUpData.session,
            demo: true
          },
          message: 'Demo user created and logged in'
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          user: data.user,
          session: data.session,
          demo: true
        },
        message: 'Demo login successful'
      })
    }

    // Handle regular login
    const validatedData = LoginSchema.parse(body)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError)
    }

    // Update last seen
    if (profile) {
      await supabase
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', data.user.id)
    }

    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
        profile: profile || null
      },
      message: 'Login successful'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'SentinelX Authentication - Login',
    endpoints: {
      login: 'POST /api/auth/login',
      demo_login: 'POST /api/auth/login with { "demo": true }'
    },
    demo_credentials: {
      email: 'demo@sentinelx.com',
      password: 'demo123',
      note: 'Use demo: true in request body for quick demo access'
    }
  })
}
