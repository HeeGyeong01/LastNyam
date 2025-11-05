import './App.css'
import { Button } from '../../../shared/src/components/Button'

function App() {
  return (
    <>
      <div className="bg-bg-0 p-8 space-y-8">
        {/* Typography Test */}
        <section className="space-y-4">
          <h1 className="font-kr-h1 kr-h1 text-brand">브랜드 kr 폰트 + 브랜드 색상</h1>
          <h1 className="font-en-h1 en-h1 text-brand">브랜드 en 폰트 + 브랜드 색상</h1>
          <h1 className="h1 text-primary">h1 폰트 + primary 색상</h1>
          <h2 className="h2-b text-brand">h2-b 폰트 + brand 색상</h2>
          <p className="p1 text-tertiary">p1 폰트 + tertiary 색상</p>
        </section>

        {/* Button Test */}
        <section className="space-y-6">
          <h2 className="h3-b text-primary">Button Components</h2>
          
          {/* Filled Buttons */}
          <div className="space-y-2">
            <h3 className="h5-b text-secondary">Filled Buttons</h3>
            <div className="flex items-start gap-4 flex-wrap">
              <Button btnStyle="filled-default">Default</Button>
              <Button btnStyle="filled-default" size="lg">Default Large</Button>
              <Button btnStyle="filled-red">Red</Button>
              <Button btnStyle="filled-yellow" size="lg">Yellow</Button>
              <Button btnStyle="filled-gray">Gray</Button>
            </div>
          </div>

          {/* Outlined Buttons */}
          <div className="space-y-2">
            <h3 className="h5-b text-secondary">Outlined Buttons</h3>
            <div className="flex items-start gap-4 flex-wrap">
              <Button btnStyle="outlined-default">Outlined</Button>
              <Button btnStyle="outlined-default" >Outlined Large</Button>
              <Button btnStyle="outlined-red">Outlined Red</Button>
            </div>
          </div>

          {/* Ghost Button */}
          <div className="space-y-2">
            <h3 className="h5-b text-secondary">Ghost Button</h3>
            <div className="flex items-start gap-4 flex-wrap">
              <Button btnStyle="ghost">Ghost Button</Button>
            </div>
          </div>

          {/* Underline Buttons */}
          <div className="space-y-2">
            <h3 className="h5-b text-secondary">Underline Buttons</h3>
            <div className="flex items-start gap-4 flex-wrap">
              <Button btnStyle="underline-default">Underline Default</Button>
              <Button btnStyle="underline-red">Underline Red</Button>
            </div>
          </div>

          {/* Rounded Buttons */}
          <div className="space-y-2">
            <h3 className="h5-b text-secondary">Rounded Buttons</h3>
            <div className="flex items-start gap-4 flex-wrap">
              <Button btnStyle="filled-default" btnShape="rounded">Rounded</Button>
              <Button btnStyle="outlined-red" btnShape="rounded">Rounded Outlined</Button>
            </div>
          </div>

          {/* Buttons with Icons */}
          <div className="space-y-2">
            <h3 className="h5-b text-secondary">Buttons with Icons (예시)</h3>
            <div className="flex items-start gap-4 flex-wrap">
              <Button btnStyle="filled-red" size="lg">
                Submit
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button btnStyle="outlined-default" size="lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </Button>
            </div>
          </div>

          {/* Disabled State */}
          <div className="space-y-2">
            <h3 className="h5-b text-secondary">Disabled State</h3>
            <div className="flex items-start gap-4 flex-wrap">
              <Button btnStyle="filled-default" disabled>Disabled</Button>
              <Button btnStyle="outlined-red" disabled>Disabled Outlined</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default App
