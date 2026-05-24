# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: _sample_failure.spec.ts >> sample failing test to capture a failure artifact @sample
- Location: tests/_sample_failure.spec.ts:7:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e5]:
  - link "Skip to content" [ref=e6] [cursor=pointer]:
    - /url: "#start-of-content"
  - generic [ref=e9]:
    - button "Test Manager" [ref=e12] [cursor=pointer]:
      - generic [ref=e15]: Test Manager
    - complementary "Header menu items" [ref=e16]:
      - list [ref=e17]:
        - listitem
        - listitem
        - listitem [ref=e18]:
          - button "notification" [ref=e20] [cursor=pointer]:
            - img [ref=e22]
        - listitem [ref=e26]:
          - button "Profile dropdown" [ref=e27] [cursor=pointer]
  - generic [ref=e28]:
    - navigation "Product Navigation" [ref=e29]:
      - heading "Product Navigation" [level=1] [ref=e30]
      - button "LambdaTest Home Dashboard" [ref=e32] [cursor=pointer]:
        - generic [ref=e33]:
          - img [ref=e35]
          - img [ref=e41]
      - generic [ref=e63]:
        - navigation "Product Secondary Navigation" [ref=e64]:
          - list [ref=e65]:
            - listitem:
              - button "Test Manager":
                - generic [ref=e67] [cursor=pointer]:
                  - generic:
                    - img
                  - generic [ref=e68]: Test Manager
            - listitem [ref=e69]:
              - button "Projects" [ref=e70] [cursor=pointer]:
                - generic [ref=e71]:
                  - generic:
                    - img
                  - generic [ref=e72]: Projects
            - listitem [ref=e73]:
              - button "Modules" [ref=e74] [cursor=pointer]:
                - generic [ref=e75]:
                  - generic:
                    - img
                  - generic [ref=e76]: Modules
            - listitem [ref=e77]:
              - button "Configurations" [ref=e78] [cursor=pointer]:
                - generic [ref=e79]:
                  - generic:
                    - img
                  - generic [ref=e80]: Configurations
            - listitem [ref=e81]:
              - button "Settings" [ref=e82] [cursor=pointer]:
                - generic [ref=e83]:
                  - generic:
                    - img
                  - generic [ref=e84]: Settings
        - list [ref=e89]:
          - listitem [ref=e90] [cursor=pointer]:
            - button "help" [ref=e91]:
              - generic [ref=e92]:
                - generic:
                  - img
                - generic [ref=e93]: Help
              - img [ref=e95]
          - listitem [ref=e97] [cursor=pointer]:
            - button "Access key" [ref=e98]:
              - generic [ref=e99]:
                - img:
                  - img
                - generic [ref=e100]: Credentials
              - img [ref=e102]
          - listitem [ref=e104] [cursor=pointer]:
            - button "Quick actions" [ref=e105]:
              - generic [ref=e106]:
                - img:
                  - img
                - generic [ref=e107]: Quick Actions
              - img [ref=e109]
    - main [ref=e114]:
      - generic [ref=e121]:
        - generic [ref=e122]:
          - generic [ref=e123]:
            - img [ref=e124]
            - generic [ref=e127]: Projects
          - heading "All your test cases information stored in projects" [level=5] [ref=e128]
        - generic [ref=e129]:
          - generic [ref=e130]:
            - img [ref=e132]
            - textbox "Search Projects" [ref=e134]
          - button "Owners" [ref=e135] [cursor=pointer]:
            - generic [ref=e137]: Owners
            - generic:
              - img
          - button "Tags" [ref=e138] [cursor=pointer]:
            - generic [ref=e140]: Tags
            - generic:
              - img
          - button "Products (1)" [ref=e141] [cursor=pointer]:
            - generic [ref=e142]:
              - generic [ref=e143]: Products
              - generic:
                - generic: "1"
                - generic: (1)
            - generic:
              - img
          - generic [ref=e144]:
            - button "Create Project" [ref=e145] [cursor=pointer]:
              - generic [ref=e146]:
                - generic:
                  - img
                - generic [ref=e147]: Create Project
            - button "Create project options" [ref=e148] [cursor=pointer]:
              - img [ref=e151]
        - generic [ref=e154]:
          - generic [ref=e155]:
            - img [ref=e156]
            - generic [ref=e159]: Loading
          - generic [ref=e160]: Loading Projects
          - generic [ref=e161]: Please hold on, this shouldn't take more than a few seconds.
```

# Test source

```ts
  1  | import { test, expect } from '../src/fixtures/fixtures';
  2  | import { UI_ROUTES } from '../src/config/constants';
  3  | import { env } from '../src/config/env';
  4  | 
  5  | // THROWAWAY: used once to generate a sample failure artifact (screenshot + trace) for the
  6  | // docs/sample-report. Deleted immediately after capture — not part of the suite.
  7  | test('sample failing test to capture a failure artifact @sample', async ({
  8  |   authedPage,
  9  |   dashboardPage,
  10 | }) => {
  11 |   await authedPage.goto(`${env.baseUrl}${UI_ROUTES.dashboard}`, { waitUntil: 'domcontentloaded' });
  12 |   await dashboardPage.waitForReady();
> 13 |   expect(await dashboardPage.hasProject('PROJECT-THAT-DOES-NOT-EXIST-9999')).toBe(true);
     |                                                                              ^ Error: expect(received).toBe(expected) // Object.is equality
  14 | });
  15 | 
```