//Read jump data
df_readJumps();

//Add extra rows to table
df_buildTableAdditions();

//Run the initial calcs
df_doCalcsInit();

//console.log(reactivations);

//Test run the ref rebuild
df_rebuildRefs();

//console.log(reactivations);
df_doCalcsUpdate();