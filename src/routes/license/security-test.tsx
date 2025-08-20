import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/license/security-test')({
  component: LicenseSecurityTest,
})

function LicenseSecurityTest() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">License Security Test</h1>
      <p className="text-muted-foreground mb-6">
        This page tests the challenge transformation security mechanism.
      </p>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <iframe 
          src="/license-security-test.html" 
          className="w-full h-screen"
          title="License Security Test"
        />
      </div>
    </div>
  )
}