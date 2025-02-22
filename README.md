# Clean Cache Action

> [!WARNING]
> This is not an official product of YUMEMI Inc.

Cleans up caches for GitHub Actions by their keys or branches. 


## Examples

### Delete all caches for a pull request after closed

```yaml
on:
  pull_request:
    types:
      - closed

jobs:
  clean:
    runs-on: ubuntu-latest
    permissions:
      actions: write
    steps:
      - uses: yumemi-inc/clean-cache-action@v1
        with:
          ref: 'refs/pull/${{ github.event.pull_request.number }}/merge'
```
