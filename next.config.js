import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const e = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@components": path.join(__dirname, "components"),
      "@contexts": path.join(__dirname, "contexts"),
      "@styles": path.join(__dirname, "styles"),
      "@public": path.join(__dirname, "public"),
      "@common": path.join(__dirname, "src", "common"),
      "@server": path.join(__dirname, "src", "server")
    };
    return config;
  }
};

export default e;
