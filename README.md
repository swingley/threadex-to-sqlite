Parse and load data from from [ThreadEx](http://threadex.rcc-acis.org/) text files into a SQLite database.

Download data files from the [ThreadEx site](http://threadex.rcc-acis.org/links.html) and put them in a folder named `raw-data` in this repo.

To generate a sqlite database from the raw data files run:
```
npm install
npm run start
```

The processing takes about two minutes on a late 2012 rMBP, half that on a late 2016 MacBook Pro w/o touchbar.

To geocode station locations, use:
```
npm run geocode
```

