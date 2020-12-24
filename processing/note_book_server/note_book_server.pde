import java.util.zip.*; //<>//
import java.io.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.io.IOException;
import java.util.regex.Pattern;
import java.util.regex.Matcher;



// protect zip slip attack
Path zipSlipProtect(ZipEntry zipEntry, Path targetDir)
  throws IOException {

  // test zip slip vulnerability
  // Path targetDirResolved = targetDir.resolve("../../" + zipEntry.getName());

  Path targetDirResolved = targetDir.resolve(zipEntry.getName());

  // make sure normalized file still has targetDir as its prefix
  // else throws exception
  Path normalizePath = targetDirResolved.normalize();
  if (!normalizePath.startsWith(targetDir)) {
    throw new IOException("Bad zip entry: " + zipEntry.getName());
  }

  return normalizePath;
}


void setup() {
  String[] lines = loadStrings("http://nbs.neolab.net/v1/notebooks/attributes?device=android&format=json");
  String joined = join(lines, "\n");


  JSONObject json = parseJSONObject(joined);
  if (json == null) {
    println("JSONObject could not be parsed");
  } else {
    JSONArray  values = json.getJSONArray("attributes");


    int dd = day();    // Values from 1 - 31
    int mm = month();  // Values from 1 - 12
    int yyyy = year();   // 2003, 2004, 2005, etc.

    int second = second();  // Values from 0 - 59
    int min = minute();  // Values from 0 - 59
    int hour = hour();    // Values from 0 - 23

    String date = String.format("%04d-%02d-%02d %02d:%02d:%02d", yyyy, mm, dd, hour, min, second);

    JSONObject root = new JSONObject();
    JSONObject root_detail = new JSONObject();

    root.put("updated", date);
    root_detail.put("updated", date);

    int numItems = values.size();

    for (int i = 0; i < numItems; i++) {
      //for (int i = 0; i < 1; i++) {
      JSONObject item = values.getJSONObject(i);
      JSONObject book = new JSONObject();
      JSONObject book_detail = new JSONObject();
      boolean need_to_add_detail = false;

      JSONArray pages = new JSONArray ();

      int s = item.getInt("section_id");
      int o = item.getInt("owner_id");
      int b = item.getInt("note_id");
      String SOBP = s + "." + o + "." + b;

      System.out.printf("Processing: %d/%d\n", i+1, numItems);

      JSONObject j = item.getJSONObject( "resource" );
      String zipfile_url = j.getString( "zipfile" );

      println( "    "+SOBP + ": " + zipfile_url);
      byte buffer[] = loadBytes(zipfile_url);
      ByteArrayInputStream bais = new ByteArrayInputStream(buffer);
      ZipInputStream zis = new ZipInputStream(bais);

      // list files in zip

      ZipEntry zipEntry = null ;
      try {
        zipEntry= zis.getNextEntry();

        while (zipEntry != null) {
          println( "    "+zipEntry.getName() );
          boolean isDirectory = false;

          // example 1.1
          // some zip stored files and folders separately
          // e.g data/
          //     data/folder/
          //     data/folder/file.txt
          if (zipEntry.getName().endsWith(File.separator)) {
            isDirectory = true;
          }

          Path newPath = zipSlipProtect(zipEntry, Paths.get("C:\\Temp\\nbs\\"));

          if (isDirectory) {
            Files.createDirectories(newPath);
          } else {

            // example 1.2
            // some zip stored file path only, need create parent directories
            // e.g data/folder/file.txt
            if (newPath.getParent() != null) {
              if (Files.notExists(newPath.getParent())) {
                Files.createDirectories(newPath.getParent());
              }
            }




            String name = zipEntry.getName();

            String pdf_name = "";
            int numPages = -1;
            String title = "";
            int ncode_end_page = -1;
            int ncode_start_page = -1;




            if (name.contains(".pdf")) {
              // copy files, nio
              Files.copy(zis, newPath, StandardCopyOption.REPLACE_EXISTING);
            }

            if (name.contains(".png")) {
              // copy files, nio
              Files.copy(zis, newPath, StandardCopyOption.REPLACE_EXISTING);
            }


            //if (name.contains(".nproj")) {
            //  // copy files, nio
            //  Files.copy(zis, newPath, StandardCopyOption.REPLACE_EXISTING);
            //}

            if (name.contains(".nproj")) {
              BufferedReader br = new BufferedReader(new InputStreamReader(zis, "UTF-8"));
              String str = null;
              float  x1=-1, y1=-1, x2=-1, y2=-1;
              float m_x1=0, m_y1=0, m_x2=0, m_y2=0;
              int pageNo = -1;
              float Xmin_t=-1.0, Ymin_t=-1.0, Xmax_t=-1.0, Ymax_t=-1.0;

              boolean pdf_path_next = false;

              book_detail.put("nproj_file", name);
              book_detail.put("section", s);
              book_detail.put("owner", o);
              book_detail.put("book", b);


              book.put("nproj_file", name);
              book.put("section", s);
              book.put("owner", o);
              book.put("book", b);


              boolean sw_book_inited = false;

              while ((str=br.readLine())!=null) {


                if ( str.contains("<title>" )) {
                  Pattern pattern = Pattern.compile("<title>(.+)</title>");
                  Matcher matcher = pattern.matcher(str);
                  if ( matcher.find( ) ) {
                    title = matcher.group(1);
                    System.out.printf( "    "+"Title=%s\n", title);


                    book_detail.put( "title", title);
                    //book_detail.put( "name", title);
                    book.put( "title", title);
                    //book.put( "name", title);
                  }
                }


                if ( str.contains("<extra_info>" )) {
                  Pattern pattern = Pattern.compile("<extra_info>pdf_page_count=([0-9]+)</extra_info>");
                  Matcher matcher = pattern.matcher(str);
                  if ( matcher.find( ) ) {
                    numPages = Integer.parseInt(matcher.group(1));
                    System.out.printf( "    "+"pdf_page_count=%d\n", numPages);

                    book_detail.put( "pdf_page_count", numPages);
                    book.put( "pdf_page_count", numPages);
                  }
                }


                if ( str.contains("<segment_info" )) {
                  Pattern pattern = Pattern.compile("ncode_start_page=\"([0-9]+)\".*ncode_end_page=\"([0-9]+)\"");
                  Matcher matcher = pattern.matcher(str);
                  if ( matcher.find( ) ) {
                    ncode_start_page = Integer.parseInt(matcher.group(1));
                    ncode_end_page = Integer.parseInt(matcher.group(2));
                    System.out.printf( "    "+"ncode start=%d, ncode end=%d\n", ncode_start_page, ncode_end_page);

                    book_detail.put( "ncode_start_page", ncode_start_page);
                    book_detail.put( "ncode_end_page", ncode_end_page);

                    book.put( "ncode_start_page", ncode_start_page);
                    book.put( "ncode_end_page", ncode_end_page);
                  }
                }



                if ( str.contains("<pdf>" )) {
                  pdf_path_next = true;
                }

                if (pdf_path_next) {
                  if ( str.contains("<path>" )) {
                    pdf_path_next = false;
                    Pattern pattern = Pattern.compile("<path>(.+)</path>");
                    Matcher matcher = pattern.matcher(str);
                    if ( matcher.find( ) ) {
                      pdf_name = matcher.group(1);
                      System.out.printf( "    "+"PDF name=%s\n", pdf_name);

                      book_detail.put( "pdf_name", pdf_name);
                      book.put( "pdf_name", pdf_name);
                    }
                  }
                }


                if ( str.contains("<page_item " ) ) {
                  Pattern pattern = Pattern.compile("crop_margin=\"([0-9.]+),([0-9.]+),([0-9.]+),([0-9.]+)\"");
                  Matcher matcher = pattern.matcher(str);
                  if ( matcher.find( ) ) {
                    m_x1 = Float.parseFloat(matcher.group(1));
                    m_y1 = Float.parseFloat(matcher.group(2));
                    m_x2 = Float.parseFloat(matcher.group(3));
                    m_y2 = Float.parseFloat(matcher.group(4));

                    m_x1 = round(m_x1* 100.0) / 100.0;
                    m_x2 = round(m_x2* 100.0) / 100.0;
                    m_y1 = round(m_y1* 100.0) / 100.0;
                    m_y2 = round(m_y2* 100.0) / 100.0;
                  }

                  pattern = Pattern.compile("number=\"([0-9]+)\"");
                  matcher = pattern.matcher(str);
                  if ( matcher.find( ) ) {
                    pageNo = Integer.parseInt(matcher.group(1));
                  }


                  pattern = Pattern.compile("x1=\"([0-9.]+)\".*y1=\"([0-9.]+)\".*x2=\"([0-9.]+)\".*.*y2=\"([0-9.]+)\"");
                  matcher = pattern.matcher(str);
                  if ( matcher.find( ) ) {
                    x1 = Float.parseFloat(matcher.group(1));
                    y1 = Float.parseFloat(matcher.group(2));
                    x2 = Float.parseFloat(matcher.group(3));
                    y2 = Float.parseFloat(matcher.group(4));

                    x1 = round(x1* 100.0) / 100.0;
                    x2 = round(x2* 100.0) / 100.0;
                    y1 = round(y1* 100.0) / 100.0;
                    y2 = round(y2* 100.0) / 100.0;
                  }
                  //System.out.printf( "    "+"page=%d, x1=%.2f, y1=%.2f, x2=%.2f, y2=%.2f, margin=(%.2f, %.2f, %.2f, %.2f)\n", pageNo+ ncode_start_page, x1, y1, x2, y2, m_x1, m_y1, m_x2, m_y2);


                  JSONObject sizeWithCropMark_pt = new JSONObject();
                  sizeWithCropMark_pt.put( "x1", x1);
                  sizeWithCropMark_pt.put( "x2", x2);
                  sizeWithCropMark_pt.put( "y1", y1);
                  sizeWithCropMark_pt.put( "y2", y2);

                  JSONObject margin_pt = new JSONObject();
                  margin_pt.put( "m_x1", m_x1);
                  margin_pt.put( "m_x2", m_x2);
                  margin_pt.put( "m_y1", m_y1);
                  margin_pt.put( "m_y2", m_y2);


                  JSONObject page = new JSONObject();
                  page.put( "sizeWithCropMark_pt", sizeWithCropMark_pt);
                  page.put( "margin_pt", margin_pt);
                  page.put( "pageNo", pageNo+ ncode_start_page);

                  pages.setJSONObject(pageNo, page);

                  float nu_to_pu = 25./168;

                  float Xmin =  (m_x1-x1) * nu_to_pu;
                  float Ymin =  (m_y1-y1) * nu_to_pu;
                  float Xmax = (x2-m_x2) * nu_to_pu;
                  float Ymax = (y2-m_y2) * nu_to_pu;

                  if ( sw_book_inited && (Xmin!= Xmin_t || Ymin != Ymin_t || Xmax != Xmax_t || Ymax!=Ymax_t) ) {
                    need_to_add_detail = true;
                  }

                  if ( !sw_book_inited) {
                    sw_book_inited=true;
                    Xmin_t = Xmin;
                    Ymin_t = Ymin;
                    Xmax_t = Xmax;
                    Ymax_t = Ymax;



                    //book_detail.put( "nu_to_pu", nu_to_pu);
                    book_detail.put( "Xmin", Xmin);
                    book_detail.put( "Ymin", Ymin);
                    book_detail.put( "Xmax", Xmax);
                    book_detail.put( "Ymax", Ymax);

                    //book.put( "nu_to_pu", nu_to_pu);
                    book.put( "Xmin", Xmin);
                    book.put( "Ymin", Ymin);
                    book.put( "Xmax", Xmax);
                    book.put( "Ymax", Ymax);
                  }
                }
              }
            }

            // copy files, classic
            /*try (FileOutputStream fos = new FileOutputStream(newPath.toFile())) {
             byte[] buffer = new byte[1024];
             int len;
             while ((len = zis.read(buffer)) > 0) {
             fos.write(buffer, 0, len);
             }
             }*/
          }

          zipEntry = zis.getNextEntry();
        }



        zis.closeEntry();


        book_detail.put("pages", pages);
        root_detail.put(SOBP, book_detail);

        if ( need_to_add_detail ) {
          root.put(SOBP, book_detail);
        } else {
          root.put(SOBP, book);
        }

        saveJSONObject(root, ".\\nbs.json");
        saveJSONObject(root_detail, ".\\nbs_detail.json");
      }
      catch (IOException e ) {
        println( e.toString());
      }
    }

    System.out.println( "download COMPLETED");
  }
}
