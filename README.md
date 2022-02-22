## Test input

Addresses don't have to be 100% exact

``` JSON
{
    "addresses": [
        "5050 columbus st se unit 194",
        "7329 Roamer Pl Las Vegas, NV 89131",
        "5424 Taylor Mill Rd Taylor Mill, KY 41015",
        "732 Independence Ave GA 30567",
        "12314 bellafonte dr Dallas",
        "6406 Maple Glen IL 60097"
    ],
    "cookiesToScrape": 3,
    "proxy": {
        "useApifyProxy": true,
        "groups": ["RESIDENTIAL"],
        "countryCode": "US"
    }
}

```

## Output

If an address was not found, its results will still be pushed, but `zpid` and `zestimate` will both be `null`

```JSON
{
  "zpid": 6891472,
  "address": "7329 Roamer Pl Las Vegas, NV 89131",
  "zestimate": 350200
}
```

If there is no Zestimate available, `zestimate` will be `"N/A"`