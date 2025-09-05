import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Apple, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Target,
  Clock,
  Flame,
  Heart,
  TrendingUp
} from 'lucide-react';
import { getMedicalHistory, updateMedicalHistory } from '../../utils/database';

const LifestylePlans = () => {
  const { currentUser } = useAuth();
  const [lifestyleData, setLifestyleData] = useState({
    dietPlan: {
      goals: '',
      restrictions: [],
      meals: [],
      waterIntake: 0,
      supplements: []
    },
    exercisePlan: {
      goals: '',
      weeklyTarget: 0,
      activities: [],
      progress: []
    },
    healthMetrics: {
      weight: [],
      bloodPressure: [],
      heartRate: [],
      sleepHours: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('diet');

  // Form states
  const [newMeal, setNewMeal] = useState({ name: '', time: '', calories: '', notes: '' });
  const [newRestriction, setNewRestriction] = useState({ type: '', description: '' });
  const [newSupplement, setNewSupplement] = useState({ name: '', dosage: '', frequency: '' });
  const [newActivity, setNewActivity] = useState({ name: '', duration: '', intensity: '', calories: '' });
  const [newMetric, setNewMetric] = useState({ type: '', value: '', date: '', notes: '' });

  useEffect(() => {
    fetchLifestyleData();
  }, [currentUser]);

  const fetchLifestyleData = async () => {
    if (currentUser) {
      try {
        const history = await getMedicalHistory(currentUser.uid);
        if (history && history.lifestylePlans) {
          setLifestyleData(history.lifestylePlans);
        }
      } catch (error) {
        console.error('Error fetching lifestyle data:', error);
        setError('Failed to load lifestyle data');
      }
    }
  };

  const saveLifestyleData = async (updatedData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const history = await getMedicalHistory(currentUser.uid) || {};
      await updateMedicalHistory(currentUser.uid, {
        ...history,
        lifestylePlans: updatedData
      });
      setLifestyleData(updatedData);
      setSuccess('Lifestyle plan updated successfully!');
    } catch (error) {
      console.error('Error updating lifestyle data:', error);
      setError('Failed to update lifestyle plan');
    } finally {
      setLoading(false);
    }
  };

  const addMeal = () => {
    if (!newMeal.name) {
      setError('Please enter a meal name');
      return;
    }

    const updatedData = {
      ...lifestyleData,
      dietPlan: {
        ...lifestyleData.dietPlan,
        meals: [...lifestyleData.dietPlan.meals, { ...newMeal, id: Date.now() }]
      }
    };
    saveLifestyleData(updatedData);
    setNewMeal({ name: '', time: '', calories: '', notes: '' });
  };

  const addRestriction = () => {
    if (!newRestriction.type) {
      setError('Please enter a restriction type');
      return;
    }

    const updatedData = {
      ...lifestyleData,
      dietPlan: {
        ...lifestyleData.dietPlan,
        restrictions: [...lifestyleData.dietPlan.restrictions, { ...newRestriction, id: Date.now() }]
      }
    };
    saveLifestyleData(updatedData);
    setNewRestriction({ type: '', description: '' });
  };

  const addSupplement = () => {
    if (!newSupplement.name) {
      setError('Please enter a supplement name');
      return;
    }

    const updatedData = {
      ...lifestyleData,
      dietPlan: {
        ...lifestyleData.dietPlan,
        supplements: [...lifestyleData.dietPlan.supplements, { ...newSupplement, id: Date.now() }]
      }
    };
    saveLifestyleData(updatedData);
    setNewSupplement({ name: '', dosage: '', frequency: '' });
  };

  const addActivity = () => {
    if (!newActivity.name) {
      setError('Please enter an activity name');
      return;
    }

    const updatedData = {
      ...lifestyleData,
      exercisePlan: {
        ...lifestyleData.exercisePlan,
        activities: [...lifestyleData.exercisePlan.activities, { ...newActivity, id: Date.now() }]
      }
    };
    saveLifestyleData(updatedData);
    setNewActivity({ name: '', duration: '', intensity: '', calories: '' });
  };

  const addHealthMetric = () => {
    if (!newMetric.type || !newMetric.value) {
      setError('Please enter metric type and value');
      return;
    }

    const updatedData = {
      ...lifestyleData,
      healthMetrics: {
        ...lifestyleData.healthMetrics,
        [newMetric.type]: [...(lifestyleData.healthMetrics[newMetric.type] || []), { 
          ...newMetric, 
          id: Date.now() 
        }]
      }
    };
    saveLifestyleData(updatedData);
    setNewMetric({ type: '', value: '', date: '', notes: '' });
  };

  const removeItem = (section, subsection, id) => {
    const updatedData = { ...lifestyleData };
    updatedData[section][subsection] = updatedData[section][subsection].filter(item => item.id !== id);
    saveLifestyleData(updatedData);
  };

  const updateGoal = (section, goal) => {
    const updatedData = {
      ...lifestyleData,
      [section]: {
        ...lifestyleData[section],
        goals: goal
      }
    };
    saveLifestyleData(updatedData);
  };

  const updateWaterIntake = (amount) => {
    const updatedData = {
      ...lifestyleData,
      dietPlan: {
        ...lifestyleData.dietPlan,
        waterIntake: amount
      }
    };
    saveLifestyleData(updatedData);
  };

  const updateWeeklyTarget = (target) => {
    const updatedData = {
      ...lifestyleData,
      exercisePlan: {
        ...lifestyleData.exercisePlan,
        weeklyTarget: target
      }
    };
    saveLifestyleData(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Lifestyle & Health Plans</h3>
        <p className="text-sm text-gray-600">Manage your diet, exercise, and health tracking</p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Lifestyle Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diet" className="flex items-center gap-2">
            <Apple className="h-4 w-4" />
            Diet Plan
          </TabsTrigger>
          <TabsTrigger value="exercise" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Exercise
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Health Metrics
          </TabsTrigger>
        </TabsList>

        {/* Diet Plan Tab */}
        <TabsContent value="diet" className="space-y-6">
          {/* Diet Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Diet Goals
              </CardTitle>
              <CardDescription>Set your dietary objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="diet-goals">Dietary Goals</Label>
                <Textarea
                  id="diet-goals"
                  value={lifestyleData.dietPlan.goals}
                  onChange={(e) => updateGoal('dietPlan', e.target.value)}
                  placeholder="e.g., Lose 10 pounds, reduce sodium intake, increase protein..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Water Intake */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Daily Water Intake
              </CardTitle>
              <CardDescription>Track your hydration goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="water-intake">Glasses per day</Label>
                <Input
                  id="water-intake"
                  type="number"
                  value={lifestyleData.dietPlan.waterIntake}
                  onChange={(e) => updateWaterIntake(parseInt(e.target.value) || 0)}
                  placeholder="8"
                  min="0"
                  max="20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Meal Planning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Meal Planning
              </CardTitle>
              <CardDescription>Plan your daily meals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Meal Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="meal-name">Meal Name</Label>
                  <Input
                    id="meal-name"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    placeholder="e.g., Breakfast, Lunch, Snack"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meal-time">Time</Label>
                  <Input
                    id="meal-time"
                    type="time"
                    value={newMeal.time}
                    onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meal-calories">Calories</Label>
                  <Input
                    id="meal-calories"
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                    placeholder="e.g., 300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meal-notes">Notes</Label>
                  <Textarea
                    id="meal-notes"
                    value={newMeal.notes}
                    onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
                    placeholder="Food items, preparation notes..."
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={addMeal} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Meal
                  </Button>
                </div>
              </div>

              {/* Existing Meals */}
              <div className="space-y-2">
                {lifestyleData.dietPlan.meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{meal.name}</h4>
                      <p className="text-sm text-gray-600">
                        Time: {meal.time} | Calories: {meal.calories}
                      </p>
                      {meal.notes && (
                        <p className="text-sm text-gray-500 mt-1">{meal.notes}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem('dietPlan', 'meals', meal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {lifestyleData.dietPlan.meals.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No meals planned yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dietary Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle>Dietary Restrictions</CardTitle>
              <CardDescription>Record any food allergies or dietary limitations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Restriction Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="restriction-type">Restriction Type</Label>
                  <Select value={newRestriction.type} onValueChange={(value) => setNewRestriction({ ...newRestriction, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allergy">Allergy</SelectItem>
                      <SelectItem value="intolerance">Intolerance</SelectItem>
                      <SelectItem value="preference">Dietary Preference</SelectItem>
                      <SelectItem value="medical">Medical Restriction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restriction-description">Description</Label>
                  <Textarea
                    id="restriction-description"
                    value={newRestriction.description}
                    onChange={(e) => setNewRestriction({ ...newRestriction, description: e.target.value })}
                    placeholder="Describe the restriction..."
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={addRestriction} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Restriction
                  </Button>
                </div>
              </div>

              {/* Existing Restrictions */}
              <div className="space-y-2">
                {lifestyleData.dietPlan.restrictions.map((restriction) => (
                  <div key={restriction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{restriction.type}</h4>
                      <p className="text-sm text-gray-600">{restriction.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem('dietPlan', 'restrictions', restriction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {lifestyleData.dietPlan.restrictions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No restrictions recorded</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Supplements */}
          <Card>
            <CardHeader>
              <CardTitle>Supplements & Vitamins</CardTitle>
              <CardDescription>Track your daily supplements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Supplement Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="supplement-name">Supplement Name</Label>
                  <Input
                    id="supplement-name"
                    value={newSupplement.name}
                    onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                    placeholder="e.g., Vitamin D, Omega-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplement-dosage">Dosage</Label>
                  <Input
                    id="supplement-dosage"
                    value={newSupplement.dosage}
                    onChange={(e) => setNewSupplement({ ...newSupplement, dosage: e.target.value })}
                    placeholder="e.g., 1000mg, 1 tablet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplement-frequency">Frequency</Label>
                  <Input
                    id="supplement-frequency"
                    value={newSupplement.frequency}
                    onChange={(e) => setNewSupplement({ ...newSupplement, frequency: e.target.value })}
                    placeholder="e.g., Once daily, Twice daily"
                  />
                </div>
                <div className="md:col-span-3">
                  <Button onClick={addSupplement} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplement
                  </Button>
                </div>
              </div>

              {/* Existing Supplements */}
              <div className="space-y-2">
                {lifestyleData.dietPlan.supplements.map((supplement) => (
                  <div key={supplement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{supplement.name}</h4>
                      <p className="text-sm text-gray-600">
                        {supplement.dosage} - {supplement.frequency}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem('dietPlan', 'supplements', supplement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {lifestyleData.dietPlan.supplements.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No supplements recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exercise Plan Tab */}
        <TabsContent value="exercise" className="space-y-6">
          {/* Exercise Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Exercise Goals
              </CardTitle>
              <CardDescription>Set your fitness objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exercise-goals">Fitness Goals</Label>
                  <Textarea
                    id="exercise-goals"
                    value={lifestyleData.exercisePlan.goals}
                    onChange={(e) => updateGoal('exercisePlan', e.target.value)}
                    placeholder="e.g., Run 5K, build muscle, improve flexibility..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekly-target">Weekly Exercise Target (hours)</Label>
                  <Input
                    id="weekly-target"
                    type="number"
                    value={lifestyleData.exercisePlan.weeklyTarget}
                    onChange={(e) => updateWeeklyTarget(parseInt(e.target.value) || 0)}
                    placeholder="5"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Exercise Activities
              </CardTitle>
              <CardDescription>Plan your workout routines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Activity Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="activity-name">Activity Name</Label>
                  <Input
                    id="activity-name"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                    placeholder="e.g., Running, Weight Training, Yoga"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-duration">Duration (minutes)</Label>
                  <Input
                    id="activity-duration"
                    type="number"
                    value={newActivity.duration}
                    onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-intensity">Intensity</Label>
                  <Select value={newActivity.intensity} onValueChange={(value) => setNewActivity({ ...newActivity, intensity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="very-high">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-calories">Calories Burned</Label>
                  <Input
                    id="activity-calories"
                    type="number"
                    value={newActivity.calories}
                    onChange={(e) => setNewActivity({ ...newActivity, calories: e.target.value })}
                    placeholder="200"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={addActivity} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
              </div>

              {/* Existing Activities */}
              <div className="space-y-2">
                {lifestyleData.exercisePlan.activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{activity.name}</h4>
                      <p className="text-sm text-gray-600">
                        Duration: {activity.duration} min | Intensity: {activity.intensity} | Calories: {activity.calories}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem('exercisePlan', 'activities', activity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {lifestyleData.exercisePlan.activities.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No activities planned yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Health Metrics Tracking
              </CardTitle>
              <CardDescription>Monitor your health indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Metric Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="metric-type">Metric Type</Label>
                  <Select value={newMetric.type} onValueChange={(value) => setNewMetric({ ...newMetric, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                      <SelectItem value="heartRate">Heart Rate</SelectItem>
                      <SelectItem value="sleepHours">Sleep Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metric-value">Value</Label>
                  <Input
                    id="metric-value"
                    value={newMetric.value}
                    onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                    placeholder="e.g., 70 kg, 120/80, 72 bpm, 8 hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metric-date">Date</Label>
                  <Input
                    id="metric-date"
                    type="date"
                    value={newMetric.date}
                    onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metric-notes">Notes</Label>
                  <Input
                    id="metric-notes"
                    value={newMetric.notes}
                    onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={addHealthMetric} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Metric
                  </Button>
                </div>
              </div>

              {/* Display metrics by type */}
              {['weight', 'bloodPressure', 'heartRate', 'sleepHours'].map((metricType) => (
                <div key={metricType} className="space-y-2">
                  <h4 className="font-medium capitalize">{metricType.replace(/([A-Z])/g, ' $1')}</h4>
                  <div className="space-y-1">
                    {lifestyleData.healthMetrics[metricType]?.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{metric.value}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(metric.date).toLocaleDateString()}
                          </span>
                          {metric.notes && (
                            <span className="text-sm text-gray-500 ml-2">- {metric.notes}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem('healthMetrics', metricType, metric.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(!lifestyleData.healthMetrics[metricType] || lifestyleData.healthMetrics[metricType].length === 0) && (
                      <p className="text-sm text-gray-500 py-2">No {metricType} records yet</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LifestylePlans;
