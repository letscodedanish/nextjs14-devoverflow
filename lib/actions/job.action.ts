import { promises as fs } from "fs";

import type { GetJobsParams } from "./shared.types";

export async function getJobs(params: GetJobsParams) {
  try {
    const {
      page = 1,
      pageSize = 10,
      filter,
      location,
      remote,
      searchQuery,
    } = params;

    // Calculate the number of jobs to skip based on the page number and page size
    const skipAmount = (page - 1) * pageSize;

    const file = await fs.readFile(
      process.cwd() + "/content/jsearch.json",
      "utf8"
    );

    const parsedFile = JSON.parse(file);

    const allJobs = parsedFile?.data || [];

    const searchQueryRegExp = new RegExp(
      (searchQuery || "").toLowerCase(),
      "i"
    );
    const locationRegExp = new RegExp((location || "").toLowerCase(), "i");

    const filteredJobs = allJobs.filter((job: any) => {
      return (
        job &&
        searchQueryRegExp.test(job.job_title) &&
        locationRegExp.test(job.job_country) &&
        (remote ? job.job_is_remote === true : true)
      );
    });

    let filterOptions = {
      job_employment_type: "",
    };

    switch (filter) {
      case "fulltime":
        filterOptions = { job_employment_type: "FULLTIME" };
        break;
      case "parttime":
        filterOptions = { job_employment_type: "PARTTIME" };
        break;
      case "contractor":
        filterOptions = { job_employment_type: "CONTRACTOR" };
        break;
      case "internship":
        filterOptions = { job_employment_type: "INTERN" };
        break;
      default:
        filterOptions = { job_employment_type: "" };
        break;
    }

    const data = filteredJobs
      .filter((job: any) =>
        filterOptions.job_employment_type !== ""
          ? job.job_employment_type === filterOptions.job_employment_type
          : true
      )
      .slice(skipAmount, skipAmount + pageSize);

    const totalJobs = allJobs.length;

    const isNext = totalJobs > skipAmount + data.length;

    return { data, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getCountryFilters() {
  try {
    const file = await fs.readFile(
      process.cwd() + "/content/countries.json",
      "utf8"
    );

    const parsedFile = JSON.parse(file);

    const result = parsedFile.map((country: any) => ({
      name: country.name,
      value: country.cca2,
    }));

    return result;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}
