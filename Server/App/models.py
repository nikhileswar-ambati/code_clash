from django.db import models

class Question(models.Model):
    DIFFICULTY_LEVELS = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    question_id = models.AutoField(primary_key=True, help_text="Unique ID for the question")
    title = models.CharField(max_length=255, help_text="Title of the question")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, help_text="Difficulty level of the question")
    topics = models.TextField(help_text="Topics related to the question, comma-separated")
    description = models.TextField(help_text="Description of the problem statement")
    testcases = models.JSONField(help_text="Test cases with inputs and expected outputs in JSON format",default=list)
    constraints = models.TextField(help_text="Constraints for the problem")
    time_limit_per_test = models.CharField(max_length=10,help_text="Time limit for each testcase")
    note = models.TextField(help_text="Explanation for sample test cases or special Note about question",default="")
    def __str__(self):
        return f"{self.question_id}: {self.title}"

class Clash(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    clash_id = models.CharField(max_length=32, unique=True)
    creator_id = models.CharField(max_length=255)
    creator_email = models.EmailField(blank=True)
    difficulty = models.CharField(max_length=10, default='Mixed')
    question_count = models.PositiveIntegerField(default=3)
    time_limit_minutes = models.PositiveIntegerField(default=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    problem_ids = models.JSONField(default=list)
    problem_snapshot = models.JSONField(default=list)
    ready_players = models.JSONField(default=list)
    notifications = models.JSONField(default=list)
    summary = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.clash_id


class ClashParticipant(models.Model):
    clash = models.ForeignKey(Clash, to_field='clash_id', db_column='clash_id', related_name='participants', on_delete=models.CASCADE)
    user_id = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    display_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, default='challenger')
    ready = models.BooleanField(default=False)
    stats = models.JSONField(default=dict)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('clash', 'user_id')

    def __str__(self):
        return f"{self.display_name} in {self.clash_id}"


class ClashSubmission(models.Model):
    clash = models.ForeignKey(Clash, to_field='clash_id', db_column='clash_id', related_name='submissions', on_delete=models.CASCADE)
    user_id = models.CharField(max_length=255)
    problem_id = models.CharField(max_length=255)
    language = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=120)
    accepted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.clash_id}: {self.user_id} {self.status}"


class ClashResult(models.Model):
    clash = models.OneToOneField(Clash, to_field='clash_id', db_column='clash_id', related_name='result', on_delete=models.CASCADE)
    winner_user_id = models.CharField(max_length=255, null=True, blank=True)
    is_draw = models.BooleanField(default=False)
    summary = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result for {self.clash_id}"


class ClashHistory(models.Model):
    clash = models.ForeignKey(Clash, to_field='clash_id', db_column='clash_id', related_name='history', on_delete=models.CASCADE)
    user_id = models.CharField(max_length=255)
    opponent_name = models.CharField(max_length=255)
    winner_name = models.CharField(max_length=255)
    score = models.CharField(max_length=40)
    duration_seconds = models.PositiveIntegerField(default=0)
    summary = models.JSONField(default=dict)
    replay_details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('clash', 'user_id')

    def __str__(self):
        return f"{self.user_id} history for {self.clash_id}"
