Parse and load data from from [ThreadEx](http://threadex.rcc-acis.org/) text files into a SQLite database.

Files in [raw-data](./raw-data) were downloaded from the [ThreadEx site](http://threadex.rcc-acis.org/links.html).

A copy of the database is included in this repo. To re-generate it, run:
```
npm install
npm run start
```

The processing takes about 2 minutes on my late 2012 rMBP.

To geocode station locations, use:  
```
npm run geocode
```

