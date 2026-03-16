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

A secondary dataset, [A Global Dataset of Directional Migration Networks of Migratory Birds](https://figshare.com/articles/dataset/A_global_dataset_of_directional_migration_networks_of_migratory_birds/26162269/3?file=48041545) provides migration path information derived from a systematic review of English and Chinese literature (1993–2023). The data already includes curated GPS coordinates, which will allow comparison with FAA incident locations to explore geographic correlations. Preprocessing will mainly involve filtering relevant species and migration routes and aligning coordinate systems with the FAA dataset.

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

#### Dataset: Aircraft Wildlife Strikes 1990-2023
All information presented here is based on the following Notebook: [M1_DataExploration](https://colab.research.google.com/drive/1rXPO2LDDgPRk97wf8cLNTDRRA6dTV_iW?usp=sharing)

**General Information about the Dataset**

The dataset has a size of 190 MB stored as an csv file and comes with an additional excel sheet that explains each column. The first column serves as an index column and tells us that their are 288'810 entries in the table.

**General information about columns**

The dataset contains 110 columns with the following attributes:

| Value   | Number of Columns |
| ------- | ----------------- |
| String  | 43                |
| Boolean | 37                |
| Integer | 17                |
| Other*  | 13                |

*e.g. Time and Date

- **Specific Damage Indicators:** A massive portion of the dataset consists of binary (Yes/No) columns indicating exactly which part of the plane was **struck** (e.g., `STR_RAD`, `STR_WING_ROT`) versus which part was actually **damaged** (e.g., `DAM_RAD`, `DAM_FUSE`). This also includes specific columns for engine ingestions (`ING_ENG1` through `ING_ENG4`).
- **Location and Geography:** These columns pinpoint where the incident happened, ranging from the specific `AIRPORT` and `RUNWAY` to broader classifications like `STATE`, `LOCATION` (miles from airport), and `FAAREGION`.
- **Aircraft Specifications and Codes:** These provide technical details about the machine involved. It includes manufacturer and model codes (`AMA`, `AMO`), engine types, the number of engines (`NUM_ENGS`), and mass class (`AC_MASS`), as well as the operator ID (`OPID`).
- **Operational Flight Conditions:** These columns describe what the plane was doing at the moment of impact, such as its `HEIGHT` (altitude), `SPEED` (knots), and the `PHASE_OF_FLT` (e.g., Take-off, Climb, Approach).
- **Environmental and Light Conditions:** These describe the surroundings at the time of the strike, including `TIME_OF_DAY` (Dawn, Day, Night, etc.), `SKY` conditions (Cloud cover), and `PRECIP` (Rain, Fog, Snow).
- **Wildlife and Biological Data:** This group focuses on the "nature" side of the collision, including the `SPECIES`, the `SIZE` of the bird, the number of birds seen versus actually struck, and whether biological remains were collected or sent for DNA analysis.
- **Impact Severity and Economic Costs:** These columns quantify the aftermath. They include the categorical `DAMAGE` level (None, Minor, Substantial, Destroyed), the number of injuries or fatalities, the time the aircraft was out of service (`AOS`), and the estimated `COST_REPAIRS`.
- **Administrative and Narrative Metadata:** Finally, there are columns used for record-keeping, such as `INDEX NR`, `INCIDENT_DATE`, and `SOURCE`, along with unstructured text fields like `REMARKS` and `COMMENTS` that provide qualitative context.

**Missing Data**

Lets have a look on all the columns that are missing at least some data:
![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/data/images/ColumnsWithMissingData.png)

Observations:
- Most columns that are missing nearly 100% of their values are cost related or very specific that may be empty often (e.g. number of fatalities --> if there were non it makes sense that there is no data on that).
- Height, speed and distance have a significant amount of missing values which could turn out to be problematic if the goal is to visualize data that is influenced by these attributes. It might be possible to then rely on the `PHASE_OF_FLT` column.
- The weather and time impact conditions (`SKY`, `PRECIP`, `TIME`) also have quite some missing values.
- The latitude and longitude are also missing approximately 10% of their values, which could be complemented by using data from the airport which is always available.

**Numerical Data**
In the following table we can see basic statistical information about numerical columns:

|index|INDEX\_NR|INCIDENT\_MONTH|INCIDENT\_YEAR|LATITUDE|LONGITUDE|EMA|EMO|AC\_MASS|NUM\_ENGS|ENG\_1\_POS|ENG\_2\_POS|ENG\_3\_POS|ENG\_4\_POS|HEIGHT|SPEED|DISTANCE|AOS|BIRD\_BAND\_NUMBER|NR\_INJURIES|NR\_FATALITIES|
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|count|288810\.0|288810\.0|288810\.0|253309\.0|253308\.0|192151\.0|186756\.0|206490\.0|206259\.0|205481\.0|191612\.0|13080\.0|3290\.0|148807\.0|94237\.0|188234\.0|14196\.0|390\.0|276\.0|24\.0|
|mean|873669\.3354523735|7\.1759738236210655|2011\.697797860185|201\.2754314260636|-90\.88024703899895|19\.755811835483552|8\.522376791107114|3\.538311782652913|2\.0139290891548973|2\.8149561273305075|2\.667536479969939|2\.9003058103975534|2\.043161094224924|865\.9603580476725|142\.58505682481405|0\.8144658350776162|91\.45441603268526|88110222\.73589744|1\.2934782608695652|2\.0416666666666665|
|std|252644\.8497625282|2\.765082457102288|8\.432310970221142|81775\.22388756633|327\.24391837441925|10\.724277832840222|12\.866404842728338|0\.8673124837356794|0\.420133136947633|2\.1138063594938994|1\.9810316245208237|1\.950648833630227|1\.4351144196801124|1843\.0988009778036|46\.650049812992314|3\.547950225516193|661\.0744719903897|91101855\.20059942|0\.7561343335907866|1\.6544844636864109|
|min|608242\.0|1\.0|1990\.0|-37\.673333|-177\.381|0\.0|0\.0|1\.0|1\.0|1\.0|1\.0|1\.0|1\.0|0\.0|0\.0|0\.0|0\.0|0\.0|1\.0|1\.0|
|25%|689320\.25|5\.0|2006\.0|32\.98764|-98\.46978|10\.0|1\.0|3\.0|2\.0|1\.0|1\.0|1\.0|1\.0|0\.0|120\.0|0\.0|1\.0|0\.0|1\.0|1\.0|
|50%|764693\.5|7\.0|2014\.0|38\.80581|-87\.90446|22\.0|4\.0|4\.0|2\.0|1\.0|1\.0|1\.0|1\.0|50\.0|140\.0|0\.0|3\.0|78977297\.0|1\.0|1\.5|
|75%|1064713\.75|9\.0|2019\.0|40\.8501|-80\.41794|31\.0|10\.0|4\.0|2\.0|5\.0|5\.0|5\.0|4\.0|900\.0|160\.0|0\.0|24\.0|189334301\.75|1\.0|2\.0|
|max|1472259\.0|12\.0|2023\.0|41154428\.0|164140\.0|92\.0|2301\.0|5\.0|4\.0|7\.0|7\.0|6\.0|5\.0|31300\.0|1250\.0|99\.0|62848\.0|282121777\.0|7\.0|8\.0|

Notable insights from the table that we have not already seen before:
- The max value for `LATITUDE` is 41,154,428.0. Since latitudes must be between -90 and 90, the data must be cleaned.
- The median height is only 50 feet, while the mean is 865 feet. This massive difference, combined with a 75th percentile of 900 feet, proves that bird strikes are extremely "bottom-heavy".
- The average strike occurs at 142 knots. Interestingly, the min speed is 0, suggesting strikes that occur while the aircraft is parked or taxiing.
- The median time a plane is out of service is 3 hours, but the max is 62,848 hours (over 7 years). This indicates some strikes result in total destruction.

**Insightful Distributions**

Let us look into some specific handpicked numerical distributions that give us more insight into the dataset.

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/data/images/IncidentPerMonth.png)

In this visualization we can already observe when most of the bird strikes happen, which allows us to already create hypothesis on why many of those bird strikes happen so often during the summer months.

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/data/images/IncidentsPerYear.png)

This left skewed distribution shows that there is a positive trend of bird strikes over the past 33 years and it is interesting to observe that some years have much larger spikes of bird strikes than others.

### Related work


> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

## Milestone 2 (17th April, 5pm)

**10% of the final grade**


## Milestone 3 (29th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

