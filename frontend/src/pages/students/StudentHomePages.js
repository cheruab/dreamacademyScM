import React from "react";
import { Grid, Card, CardContent, Typography, Divider } from "@mui/material";
import StudentSubjectss from "./StudentSubjectss";
import ViewStdAttendances from "./ViewStdAttendances";
import StudentComplains from "./StudentComplains";

const StudentHomePages = ({ child }) => {
  return (
    <div
      style={{
        padding: "30px 15px",
        backgroundColor: "#f5f6fa",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#2c3e50", textAlign: "center" }}
      >
        Welcome, {child?.name || "Parent"}
      </Typography>
      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ color: "#7f8c8d", mb: 4, maxWidth: 600, margin: "0 auto", textAlign: "center" }}
      >
        Here’s a quick overview of your child's academic activity
      </Typography>

      <Grid container spacing={4} direction="column">
        {/* Subjects */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: 3,
              backgroundColor: "#ffffff",
              width: { xs: "100%", sm: "90%", md: "70%" },
              margin: "0 auto",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#2980b9", mb: 1 }}
              >
                📚 Subjects
              </Typography>
              <Divider sx={{ marginY: 2 }} />
              <StudentSubjectss studentId={child._id} child={child} />
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: 3,
              backgroundColor: "#ffffff",
              width: { xs: "100%", sm: "90%", md: "70%" },
              margin: "0 auto",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#27ae60", mb: 1 }}
              >
                📝 Attendance
              </Typography>
              <Divider sx={{ marginY: 2 }} />
              <ViewStdAttendances childData={child} />
            </CardContent>
          </Card>
        </Grid>

        {/* Complaints */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: 3,
              backgroundColor: "#ffffff",
              width: { xs: "100%", sm: "90%", md: "70%" },
              margin: "0 auto",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#c0392b", mb: 1 }}
              >
                💬 Complaints
              </Typography>
              <Divider sx={{ marginY: 2 }} />
              <StudentComplains child={child} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default StudentHomePages;

