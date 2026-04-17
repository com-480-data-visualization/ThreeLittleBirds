# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Roxan Jaecklin | 424398 |
| Samuel Waridel | 330169 |
| Martin Fähnrich | 423634 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (20th March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

The main dataset for this project is the [Federal Aviation Administration (FAA) Aircraft Wildlife Strike Database (1990–2023)](https://www.kaggle.com/datasets/dianaddx/aircraft-wildlife-strikes-1990-2023), available on Kaggle. It documents incidents of wildlife strikes involving aircraft, primarily bird-related events. The dataset originates from a reputable source (FAA) and carries a usability score of 10 on Kaggle, suggesting high-quality and well-maintained data.

Although the dataset is comprehensive—with over 100 columns covering species, aircraft type, flight phase, and location—some preprocessing will be required. The main tasks include handling missing or unknown entries (notably for bird species), addressing outliers in numeric variables, and ensuring consistent formatting of location and date fields. Overall, the data quality is strong, and preprocessing will focus on cleaning rather than extensive transformation.

A complementary dataset, [A Global Dataset of Directional Migration Networks of Migratory Birds](https://figshare.com/articles/dataset/A_global_dataset_of_directional_migration_networks_of_migratory_birds/26162269/3?file=48041545) provides migration path information derived from a systematic review of English and Chinese literature (1993–2023). The data already includes curated GPS coordinates, which will allow comparison with FAA incident locations to explore geographic correlations. Preprocessing will mainly involve filtering relevant species and migration routes and aligning coordinate systems with the FAA dataset.

The main challenge will be integrating these datasets due to potential differences in spatial resolution and taxonomic naming conventions, but overall, both sources are clean and ready for analysis.


### Problematic

**Topic:**
 Visualizing the Spatial–Temporal “Danger Zone” of Aviation Bird Strikes

**Overview:**
This project explores the intersection of human air travel and natural bird migration. Using FAA wildlife strike data combined with global avian migration routes, we aim to visualize where and when aircraft are most at risk of encountering birds. The central axes of the visualization will be space (geographic location), time (seasonality, year, and flight phase), and flight conditions (altitude and weather).

**Motivation:**
Bird strikes pose both economic and safety threats to aviation, causing significant repair costs and operational disruptions. By overlaying strike incidents with migratory corridors, this project aims to turn historical data into predictive insight — shifting focus from “where strikes happened” to understanding why risk peaks at specific altitudes or seasons.

**Target Audience:**
- Aviation safety officers seeking to anticipate seasonal risks near specific airports.
- Environmental researchers examining how air traffic overlaps with migratory pathways.
- The general public interested in visualizing the shared aerial space between humans and wildlife.


**Analytical Components:**
1. Geospatial correlation: Map overlaps between strike locations and migration routes to identify risk hotspots.
2. Temporal analysis: Examine how strike frequency and severity change across months, years, and airports.
3. Damage profiling: Visualize which aircraft components are most affected and under what flight conditions, offering insights for preventive measures.


### Exploratory Data Analysis

The exploratiry data analysis has been done in the following notebook: [M1 ThreeLittleBirds](https://colab.research.google.com/drive/1rXPO2LDDgPRk97wf8cLNTDRRA6dTV_iW?usp=sharing)

#### Bird Strikes

The 190 MB CSV contains 288,810 entries across 110 columns. Features include binary damage indicators (e.g., struck vs. damaged parts), geography, aircraft specs, flight conditions (speed/altitude), environmental factors (weather/light), wildlife species, and economic costs.

**Missing Data & Quality**

- Gaps: Cost and fatality columns are largely empty. Height, speed, and distance have significant missing values, requiring reliance on PHASE_OF_FLT for context. Weather and coordinates (~10%) also have gaps.
- Cleaning Needed: Latitude values contain errors (max > 41M) and must be cleaned to the valid $\pm 90$ range.

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/public/data/images/ColumnsWithMissingData.png)


**Key Statistical Insights**

- Altitude: Strikes are extremely "bottom-heavy"; the median height is 50 ft, while the mean is 865 ft.
- Speed: The average strike occurs at 142 knots, though some occur at 0 knots (parked/taxiing).
- Severity: Out-of-service time (AOS) averages 3 hours, but outliers reach 7+ years, indicating total destruction.

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/public/data/images/IncidentPerMonth.png)

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/public/data/images/IncidentsPerYear.png)

**Notable Trends** 

- Analysis shows a clear seasonal peak in summer and a steady upward trend in reported strikes over the 33-year period.

#### Bird FLight Paths

The complementary dataset contains 42,844 entries across 26 columns. It tracks global avian movement via GPS sensor nodes (Origin, Transit, Wintering) and includes full taxonomic classifications (Order, Family, Genus), English names, and IUCN Red List (2023) conservation statuses.

**Missing Data & Quality**

- High Integrity: The dataset is exceptionally complete, with only the Provinces column missing a negligible 19 values (<0.05%).
- Modern Precision: 75% of the data is from 2010 or later, ensuring that the insights are based on modern, high-resolution satellite telemetry rather than legacy banding methods.

**Key Statistical Insights**

- Geography: While coverage is global (spanning from -83° to +78° latitude), the mean latitude of 29.9°N indicates a significant focus on Northern Hemisphere flyways.
- Timing: Migration is highly bimodal. The Autumn surge (July–September) is the largest movement window, followed by a secondary Spring peak (March–April).
- Conservation: While 85.4% are "Least Concern," nearly 15% of tracked movements involve at-risk species (Vulnerable to Critically Endangered), providing vital data for protected transit nodes.

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/public/data/images/FrequencyOfMigrationStartsByMonth.png)

**Notable Trends**

The data reveals a massive concentration of activity during the late summer months, identifying a critical temporal window where high bird density and biodiversity risk intersect.


### Related work


The dataset used in this project originates from the Federal Aviation Administration (FAA) Wildlife Strike Database and contains reports of strikes involving different aircraft since 1990. Because it covers a lot of time and its detailed attributes, the dataset has been widely used for exploratory analysis and visualization projects. Previous work with this dataset has primarily focused on statistical summaries and visualizations. Many analyses explore the frequency of strikes over time, identify the most involved species, or analyze the phases of flight where most incidents happen. Other projects utilize geographic patterns and focus on identifying airports or regions with high numbers of strikes, where the data is often presented using individual charts such as time-series plots, bar charts, or maps highlighting incident hotspots. [Example 1](https://www.kaggle.com/code/dianaddx/aircraft-wildlife-strikes-1990-2023-eda), [Example 2](https://www.kaggle.com/code/justin2028/which-month-has-the-most-bird-airstrikes).

These approaches provide valuable insight, but because they often present information through a series of separate visualizations, navigating through them can make it overwhelming. Especially if you want a comprehensive overview of the data to explore relationships between multiple variables simultaneously. This [report](https://www.faa.gov/airports/airport_safety/wildlife/wildlife-strike-report-1990-2024) from the FAA demonstrates a good example of how overwhelming it can be. Our approach addresses this limitation by proposing a multi-dimensional and interactive visualization that allows users to explore several aspects of the dataset within a single interface. For the design, we drew mostly inspiration from aviation visualization tools such as Flightradar24, which provides a map-based overview of global flight activity. Additionally, heatmaps of frequently affected regions were considered a way to highlight the geographic concentrations of strikes, as well as affected machinery on the plane.  

For the complementary dataset we haven't found any usages as it doesn't have any citations yet. Similar datasets have been used to analyze endagerment of migratory bird species, [Example 3](http://pdf.sciencedirectassets.com/321112/1-s2.0-S2590332222X0002X/1-s2.0-S2590332223003962/main.pdf?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFkaCXVzLWVhc3QtMSJIMEYCIQCXkxX%2FwX79wnCueGMu6UrJ3av0%2FQE9JBgPIbc9Gf1SBwIhAMLSY0ULmzJX3NcVVzig8bYCzyOdufUrpiyctOiNggk0KrMFCCIQBRoMMDU5MDAzNTQ2ODY1IgzN9yWB7iyKmF2Ut2wqkAUYpNeUD7OnwH49NYEN8EFdHYxZCasKYZiVQK2iVbLLra3wYG%2FqBZVLRY53dRgrP6MiChTwL9EV1yK1A7tlHSMlt15yIYmG8KAHPRfj6%2Bq3Ti2GFqIWzW7fn1%2BfCKr2o5ty3PHKLLe8VbU3wH997bCfZJgGOD7Q7Toc6WWQdb9e0pZuromli4nXTJQzwF8RCa4YpwNKxT94OqQtyIFHA2fFpgIcbLNtJ8F45xx7rclKe0G5XFpH0WiY5V7gEc4gvNuathdlXZ6UMnpy3V8pgpooefEDoXefYdi7pLttUb4HTrOgL1Egzd5NU2gPO7bFsOdDsFF%2F0Gf6LRG37hwZq6uPzuOQv1l%2BWmQIc%2FzFAX%2BLc4q7mTwQx2GHNQG%2F483NP2Iof21Etu4s3FUGAUyR%2FTgpZZ0qsfaEwd5MdlJGPjIPhsAWd1kjGcZD7vOl9cg2RlsGL2EHPUWrVh9%2Fsw%2FJ5aaLinwvj0Z66HTgQ0HkKkN47FnipAmNirJNOgEBvaquPq0ZhX22Gvop3y8Q%2B5vIxsqT%2FU8tW700bcBY4f1MBgga%2BabD4DvzIzwFHZC2gyLfl3nS0Ii6bHqDzyCRTKtZPq3TYGX9naL7EWh9Rieb084gpzrRkWlQ5H7tNGumzLGSl8H82Wjh2Fcn8zbcGJQRzE2bYDT1UslZwfdciQ8zsN38QEgUTnR3mn3v3Pveha9pNzxYZVgrrMXspjABWAj%2BukFhE8Viwm9bF8TlK0axHx%2BkZGV2wA%2FLCEGXLm0iXgRRnr8LEk8xINSqWjquvlNpzd3lZtMKyOjaY6WkT4KoU%2Bjy5jFO6a6FTPmQz9d0Gj6cHeks2IGjrrvyUEixqScilCIn4dOfGcPvzaZeSkMlYE4rRzDqyfDNBjqwAeik7xJbNFDCbqSqG9t98%2BUauLy5VPMn4z6TEuy98kwyvA0rNMGASDamkFmKHqfV6ji2qRd6zQwd4pw%2BlHpwLNMxmU6WIz7UmZiBHXqy7sYAHiGDMAgGSbuWteFLLTjTkgQp0wx%2BxeTh41pbFPoA0b7U%2F6eCcAl8GZhU0gL7KlWCa2vQF9lhIlR4qRDWoG6RwchQ0NV84acjQVXDnz7qm02QDo8wApNcXfoBUHBEgAtq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260319T174039Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAQ3PHCVTYSYANV362%2F20260319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=1c95d74728f593f12ac42edf6cb0f22a6f93a23ad039570499c8b30b7609808b&hash=5fb05a482c799f523c3f81a0a284b65e6cf1a7ad06cb02fef74dd19a3c4a0dd9&host=68042c943591013ac2b2430a89b270f6af2c76d8dfd086a07176afe7c76c2c61&pii=S2590332223003962&tid=spdf-d68a2299-1490-4bfd-8b16-e2ca44bc9627&sid=b57967669d872942fc0b3278a92a7e3663c2gxrqb&type=client&tsoh=d3d3LnNjaWVuY2VkaXJlY3QuY29t&rh=d3d3LnNjaWVuY2VkaXJlY3QuY29t&ua=030c5f0b0704565650&rr=9dee43723c323b58&cc=ch), or to analyze different migration patterns and influences of environmental conditions; [Example 4](https://www.kaggle.com/code/sivaramg23/bird-migration-analysis).


## Milestone 2 (17th April, 5pm)

**10% of the final grade**

Google Docs: [M2_Docs](https://docs.google.com/document/d/1uXNUvgiqn1qukKXd6VfytE65qpUvLgwY8Lny9tntYhM/edit?usp=sharing)

PDF: [M2_PDF](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/public/data/M2_ThreeLittleBirds.pdf)

Functional Project Prototype: https://three-little-birds-nine.vercel.app

## Milestone 3 (29th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

## Setup

This project uses Webpack, Babel, and D3.js. To ensure we are all working in the same environment, follow these steps to set up the project locally.

1. Prerequisites
Ensure you have Node.js installed (LTS version recommended). This includes npm, our package manager.

2. Initial Setup
Clone the repository and install the dependencies defined in package.json:
```bash
# Clone the repo (replace with your actual SSH/HTTPS link)
git clone https://github.com/com-480-data-visualization/ThreeLittleBirds.git

# Enter the directory
cd ThreeLittleBirds

# Install all libraries (D3, Leaflet, Webpack, etc.)
npm install
```

3. Local Development
To start the development server with Hot Module Replacement (HMR), run:
```bash
npm start # To run on a specific port you can add "-- --port portnumber
```
- The site will be available at: http://localhost:8080
- Any changes you save in src/ will automatically refresh the browser.

4. Project Structure
- src/main.js: The entry point for our JavaScript.
- src/index.html: The main HTML template.
- src/components/: Place individual visualization logic here.
- src/assets/: Store data files (CSV/JSON) here.

5. Deployment
We use Continuous Deployment via Vercel.
- Do not push to master directly.
- Create a feature branch for your work.
- Open a Pull Request (PR). Vercel will generate a preview link for your branch so we can review the visualizations live before merging.
