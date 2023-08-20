import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  userAgent: "Alpha Upload"
})

export class Repo {
  name: string;
  link: string;
  desc: string | null;
  releases: Array<Release>;

  constructor(name: string, link: string, desc: string | null, releases: Array<Release>) {
    this.name = name;
    this.link = link;
    this.desc = desc;
    this.releases = releases;
  }

  getVersions(): string[] {
    let versions: string[] = [];
    this.releases.forEach((release) => {
      versions.push(release.version)
    });
    return versions;
  }

  getBoards(): string[] {
    let boards: string[] = [];
    // Assume first release containing assets has the supported boards for the repo
    // TODO(Manicben): Extend this to support additional boards in newer releases
    this.releases[0].assets.forEach((asset) => {
      boards.push(asset.board)
    });
    return boards;
  }

  getReleaseByVersion(version: string): Release {
    return this.releases.filter((element) => element.version === version)[0];
  }
}

export class Release {
  version: string;
  assets: Array<Asset>;

  constructor(version: string, assets: Array<Asset>) {
    this.version = version;
    this.assets = assets;
  }

  getURLByBoard(board: string): string {
    return this.assets.filter((element) => element.board === board)[0].url;
  }
}

export class Asset {
  name: string;
  board: string;
  url: string;

  constructor(name: string, url: string) {
    this.name = name,
    this.board = getBoardName(name),
    this.url = url;
  }
}

export const getRepo = async (repoURI: string): Promise<Repo> => {
  const split = repoURI.split("/")
  const params = {owner: split[0], repo: split[1]}
  const repoResult = await octokit.repos.get(params);
  const releasesResult = await octokit.repos.listReleases(params);

  let releases: Array<Release> = [];
  releasesResult.data.forEach((release) => {
    let assets: Array<Asset> = [];
    release.assets.forEach((asset) => {
      assets.push(new Asset(
        asset.name,
        asset.browser_download_url,
      ))
    })
    // If no assets, then we discard the release
    if (assets.length > 0) {
      releases.push(new Release(
        release.tag_name,
        assets,
      ))
    }
  })

  return new Repo(
    repoResult.data.name,
    repoResult.data.html_url,
    repoResult.data.description,
    releases.reverse(),
  )
}

function getBoardName(assetName: string): string {
  const arr = assetName.match("^.*-(.*).hex$")
  if (arr) {
    return arr[1];
  }
  return "";
}
