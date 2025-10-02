'use client';
import { Star } from "lucide-react";
import { designTokens, componentStyles } from './design-tokens';

export default function Wireframe214() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: designTokens.colors.white,
        fontFamily: designTokens.typography.fontFamily,
        padding: designTokens.spacing.lg
      }}
    >
      {/* Navbar */}
      <nav
        className="w-full flex items-center justify-between mb-8"
        style={{
          height: componentStyles.navbar.height,
          backgroundColor: componentStyles.navbar.backgroundColor,
          borderBottom: componentStyles.navbar.borderBottom,
          padding: componentStyles.navbar.padding
        }}
      >
        {/* Left Side */}
        <div className="flex items-center" style={{ gap: designTokens.spacing.lg }}>
          <button
            className="rounded"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: designTokens.colors.surface.secondary
            }}
          ></button>
          <div
            className="rounded"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: designTokens.colors.primary
            }}
          ></div>
          <div
            className="rounded-full"
            style={{
              width: '36px',
              height: '40px',
              backgroundColor: designTokens.colors.lightGray
            }}
          ></div>
          <button
            className="rounded"
            style={{
              width: '24px',
              height: '32px',
              backgroundColor: designTokens.colors.surface.secondary
            }}
          ></button>
        </div>

        {/* Navbar Content */}
        <div className="flex items-center" style={{ gap: designTokens.spacing.lg }}>
          <button
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
              fontSize: designTokens.typography.sizes.sm,
              color: designTokens.colors.text.secondary,
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = designTokens.colors.primary}
            onMouseOut={(e) => e.currentTarget.style.color = designTokens.colors.text.secondary}
          >
            Home
          </button>
          <button
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
              fontSize: designTokens.typography.sizes.sm,
              color: designTokens.colors.text.secondary,
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = designTokens.colors.primary}
            onMouseOut={(e) => e.currentTarget.style.color = designTokens.colors.text.secondary}
          >
            Jobs
          </button>
          <button
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
              fontSize: designTokens.typography.sizes.sm,
              color: designTokens.colors.text.secondary,
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = designTokens.colors.primary}
            onMouseOut={(e) => e.currentTarget.style.color = designTokens.colors.text.secondary}
          >
            Candidates
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center" style={{ gap: designTokens.spacing.lg }}>
          <input
            type="text"
            placeholder="Search..."
            style={{
              ...componentStyles.input,
              width: '240px'
            }}
          />
          <div className="flex" style={{ gap: designTokens.spacing.sm }}>
            <button style={componentStyles.button.primary}>
              Sign Up
            </button>
            <button style={componentStyles.button.outline}>
              Log In
            </button>
          </div>
          <div
            className="rounded-full"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: designTokens.colors.lightGray
            }}
          ></div>
        </div>
      </nav>

      <div className="flex max-w-5xl mx-auto" justify-between>
        {/* Main Container */}
        <div style={{ ...componentStyles.container, flex: 1 }}>
          {/* Hero Section */}
          <div style={{ marginBottom: designTokens.spacing['3xl'] }}>
            <h1
              style={{
                fontSize: designTokens.typography.sizes['4xl'],
                fontWeight: designTokens.typography.weights.semibold,
                color: designTokens.colors.text.primary,
                marginBottom: designTokens.spacing.lg,
                lineHeight: '1.2'
              }}
            >
              You&apos;re one conversation away from your perfect hire.
            </h1>
            <p
              style={{
                fontSize: designTokens.typography.sizes.lg,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing['3xl']
              }}
            >
              An intuitive AI interface built to save hours and deliver top matches.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
              <button
                style={{
                  ...componentStyles.button.primary,
                  width: '100%',
                  padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(120, 70, 200)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = designTokens.colors.primary}
              >
                Get Started Free
              </button>
              <button
                style={{
                  ...componentStyles.button.outline,
                  width: '100%',
                  padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = designTokens.colors.surface.secondary}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Watch Demo
              </button>
              <button
                style={{
                  ...componentStyles.button.secondary,
                  width: '100%',
                  padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(12, 140, 95)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = designTokens.colors.secondary}
              >
                Try AI Agent
              </button>
              <button
                style={{
                  ...componentStyles.button.primary,
                  width: '100%',
                  padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`,
                  backgroundColor: designTokens.colors.purple
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(120, 70, 200)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = designTokens.colors.purple}
              >
                Schedule Call
              </button>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: designTokens.colors.surface.border,
              marginBottom: designTokens.spacing.xl
            }}
          ></div>

          {/* Testimonial Section */}
          <div style={{ marginBottom: designTokens.spacing['3xl'] }}>
            <p
              style={{
                fontSize: designTokens.typography.sizes.lg,
                color: designTokens.colors.text.primary,
                fontStyle: 'italic',
                marginBottom: designTokens.spacing.lg
              }}
            >
              &ldquo;No wasted time, my Fully Autonomous AI agent does the heavy lifting so I can focus on decisions.&rdquo;
            </p>

              {/* Rating */}
              <div className="flex items-center" style={{ gap: designTokens.spacing.xs }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={25}
                    fill={designTokens.colors.primary}
                    stroke="none"
                    className="text-yellow-400"
                  />
                ))}
              </div>
            
          </div>
        </div>

        {/* Auth Card */}
        <div
          style={{
            ...componentStyles.card,
            ...componentStyles.authCard,
            height: 'fit-content'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-center"
            style={{ marginBottom: designTokens.spacing.xl }}
          >
            <div className="flex items-center" style={{ gap: designTokens.spacing.md }}>
              <button
                className="rounded"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: designTokens.colors.surface.secondary
                }}
              ></button>
              <div
                className="rounded"
                style={{
                  width: '64px',
                  height: '56px',
                  backgroundColor: designTokens.colors.primary
                }}
              ></div>
              <div
                className="rounded-full"
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: designTokens.colors.lightGray
                }}
              ></div>
              <button
                className="rounded"
                style={{
                  width: '40px',
                  height: '48px',
                  backgroundColor: designTokens.colors.surface.secondary
                }}
              ></button>
            </div>
          </div>

          <h2
            style={{
              fontSize: designTokens.typography.sizes['2xl'],
              fontWeight: designTokens.typography.weights.semibold,
              textAlign: 'center',
              marginBottom: designTokens.spacing.xl,
              color: designTokens.colors.text.primary
            }}
          >
            Sign up for free
          </h2>

          {/* Social Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md, marginBottom: designTokens.spacing.xl }}>
            <button
              style={{
                ...componentStyles.button.outline,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = designTokens.colors.surface.secondary}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: designTokens.colors.error,
                  borderRadius: designTokens.borderRadius.sm
                }}
              ></div>
              <span>Continue with Google</span>
            </button>
            <button
              style={{
                ...componentStyles.button.outline,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = designTokens.colors.surface.secondary}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#0077B5',
                  borderRadius: designTokens.borderRadius.sm
                }}
              ></div>
              <span>Continue with LinkedIn</span>
            </button>
            <button
              style={{
                ...componentStyles.button.outline,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = designTokens.colors.surface.secondary}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: designTokens.colors.black,
                  borderRadius: designTokens.borderRadius.sm
                }}
              ></div>
              <span>Continue with GitHub</span>
            </button>

            {/* Divider */}
            <div
              className="flex items-center"
              style={{ margin: `${designTokens.spacing.lg} 0` }}
            >
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  backgroundColor: designTokens.colors.surface.border
                }}
              ></div>
              <span
                style={{
                  padding: `0 ${designTokens.spacing.md}`,
                  fontSize: designTokens.typography.sizes.sm,
                  color: designTokens.colors.text.muted
                }}
              >
                or
              </span>
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  backgroundColor: designTokens.colors.surface.border
                }}
              ></div>
            </div>
          </div>

          {/* Email Input */}
          <div style={{ marginBottom: designTokens.spacing.lg }}>
            <label
              style={{
                display: 'block',
                fontSize: designTokens.typography.sizes.sm,
                fontWeight: designTokens.typography.weights.medium,
                color: designTokens.colors.text.primary,
                marginBottom: designTokens.spacing.sm
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                ...componentStyles.input,
                width: '100%'
              }}
            />
            <p
              style={{
                fontSize: designTokens.typography.sizes.xs,
                color: designTokens.colors.text.muted,
                marginTop: designTokens.spacing.xs
              }}
            >
              Help text
            </p>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: designTokens.spacing.xl }}>
            <label
              style={{
                display: 'block',
                fontSize: designTokens.typography.sizes.sm,
                fontWeight: designTokens.typography.weights.medium,
                color: designTokens.colors.text.primary,
                marginBottom: designTokens.spacing.sm
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              style={{
                ...componentStyles.input,
                width: '100%'
              }}
            />
          </div>

          {/* Sign Up Button */}
          <button
            style={{
              ...componentStyles.button.primary,
              width: '100%',
              marginBottom: designTokens.spacing.lg
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(120, 70, 200)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = designTokens.colors.primary}
          >
            Sign up
          </button>

          {/* Footer Link */}
          <div
            style={{
              textAlign: 'center',
              fontSize: designTokens.typography.sizes.sm
            }}
          >
            <span style={{ color: designTokens.colors.text.secondary }}>
              Already have an account?{' '}
            </span>
            <button
              style={{
                color: designTokens.colors.primary,
                backgroundColor: 'transparent',
                border: 'none',
                textDecoration: 'underline',
                fontSize: designTokens.typography.sizes.sm
              }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'none'}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'underline'}
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
